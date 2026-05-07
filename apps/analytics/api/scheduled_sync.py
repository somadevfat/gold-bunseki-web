from __future__ import annotations

import hashlib
import json
import os
import tempfile
import threading
import time
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from datetime import time as dt_time
from pathlib import Path
from zoneinfo import ZoneInfo

DEFAULT_TIMEZONE = "Asia/Tokyo"
DEFAULT_POLL_SECONDS = 30
DEFAULT_DUE_WINDOW_SECONDS = 90


@dataclass(frozen=True)
class ScheduledSyncConfig:
    """
    ScheduledSyncConfig は定時JSON差分同期の実行設定です。
    @responsibility 環境変数由来の同期時刻・監視ファイル・状態保存先を型付きで保持する。
    """

    scheduled_times: tuple[dt_time, ...]
    calendar_path: Path
    state_path: Path
    timezone_name: str = DEFAULT_TIMEZONE
    poll_seconds: int = DEFAULT_POLL_SECONDS
    due_window_seconds: int = DEFAULT_DUE_WINDOW_SECONDS

    @classmethod
    def from_env(cls) -> "ScheduledSyncConfig | None":
        """
        環境変数からスケジューラ設定を生成します。
        @responsibility SCHEDULED_SYNC_TIMES の有無で有効/無効を判断し、
        指定時は実行設定へ変換する。
        """
        times = parse_scheduled_times(os.environ.get("SCHEDULED_SYNC_TIMES", ""))
        if not times:
            return None

        return cls(
            scheduled_times=times,
            calendar_path=resolve_calendar_cache_path(
                os.environ.get("CALENDAR_CACHE_PATH")
            ),
            state_path=Path(
                os.environ.get(
                    "SCHEDULED_SYNC_STATE_PATH",
                    str(Path(__file__).resolve().parent.parent / ".sync_state.json"),
                )
            ),
            timezone_name=os.environ.get("SCHEDULED_SYNC_TIMEZONE", DEFAULT_TIMEZONE),
            poll_seconds=int(
                os.environ.get("SCHEDULED_SYNC_POLL_SECONDS", DEFAULT_POLL_SECONDS)
            ),
            due_window_seconds=int(
                os.environ.get(
                    "SCHEDULED_SYNC_DUE_WINDOW_SECONDS",
                    DEFAULT_DUE_WINDOW_SECONDS,
                )
            ),
        )


@dataclass(frozen=True)
class ScheduledSyncResult:
    """
    ScheduledSyncResult は1回の定時差分判定結果です。
    @responsibility 呼び出し元が同期実行/スキップ理由を判別できる
    結果を表現する。
    """

    status: str
    message: str
    slot_key: str | None = None
    calendar_hash: str | None = None


class JsonDiffSyncScheduler:
    """
    JsonDiffSyncScheduler はMT5カレンダーJSONの定時差分同期を管理します。
    @responsibility 指定時刻にJSONの内容ハッシュを確認し、
    差分がある場合だけ同期callbackを起動する。
    """

    def __init__(
        self,
        config: ScheduledSyncConfig,
        sync_callback,
        now_provider=None,
        sleep_func=time.sleep,
    ):
        self.config = config
        self.sync_callback = sync_callback
        self.now_provider = now_provider or self._default_now
        self.sleep_func = sleep_func
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        """
        バックグラウンドスレッドでスケジューラを開始します。
        @responsibility FastAPI起動中に重複スレッドを作らず定期判定ループを開始する。
        """
        if self._thread and self._thread.is_alive():
            return

        self._thread = threading.Thread(
            target=self._run_loop,
            name="scheduled-json-sync",
            daemon=True,
        )
        self._thread.start()

    def stop(self) -> None:
        """
        バックグラウンドスレッドの停止を要求します。
        @responsibility FastAPI終了時にスケジューラループを止め、
        短時間だけjoinして終了を待つ。
        """
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=5)

    def evaluate_once(self, now: datetime | None = None) -> ScheduledSyncResult:
        """
        現在時刻で1回だけ差分同期判定を実行します。
        @responsibility 指定時刻・前回状態・JSONハッシュを見て
        同期callback実行可否を決める。
        """
        current = now or self.now_provider()
        due_at = find_due_time(
            current,
            self.config.scheduled_times,
            self.config.due_window_seconds,
        )
        if due_at is None:
            return ScheduledSyncResult("idle", "No scheduled sync slot is due.")

        slot_key = build_slot_key(due_at.date(), due_at.time())
        state = read_state(self.config.state_path)
        if state.get("last_slot_key") == slot_key:
            return ScheduledSyncResult(
                "already_processed",
                "This scheduled slot was already processed.",
                slot_key=slot_key,
            )

        if not self.config.calendar_path.exists():
            return ScheduledSyncResult(
                "missing_calendar",
                f"Calendar JSON was not found: {self.config.calendar_path}",
                slot_key=slot_key,
            )

        current_hash = hash_file(self.config.calendar_path)
        if state.get("last_calendar_hash") == current_hash:
            write_state(
                self.config.state_path,
                {
                    **state,
                    "last_slot_key": slot_key,
                    "last_checked_at": current.isoformat(),
                    "last_status": "unchanged",
                },
            )
            return ScheduledSyncResult(
                "unchanged",
                "Calendar JSON did not change since the last successful sync.",
                slot_key=slot_key,
                calendar_hash=current_hash,
            )

        self.sync_callback()
        write_state(
            self.config.state_path,
            {
                "last_calendar_hash": current_hash,
                "last_slot_key": slot_key,
                "last_synced_at": current.isoformat(),
                "last_status": "synced",
            },
        )
        return ScheduledSyncResult(
            "synced",
            "Calendar JSON changed; sync callback was triggered.",
            slot_key=slot_key,
            calendar_hash=current_hash,
        )

    def _run_loop(self) -> None:
        """
        停止要求まで定期的に差分判定を実行します。
        @responsibility poll間隔でevaluate_onceを呼び、同期結果や例外をログへ出す。
        """
        print(
            "[ScheduledSync] Started with slots: "
            + ", ".join(t.strftime("%H:%M") for t in self.config.scheduled_times)
        )
        while not self._stop_event.is_set():
            try:
                result = self.evaluate_once()
                if result.status != "idle":
                    print(f"[ScheduledSync] {result.status}: {result.message}")
            except Exception as exc:
                print(f"[ScheduledSync] Error: {exc}")

            self._stop_event.wait(self.config.poll_seconds)

    def _default_now(self) -> datetime:
        """
        設定されたタイムゾーンの現在時刻を返します。
        @responsibility スケジューラ判定用の時計をtimezone-aware datetimeとして
        供給する。
        """
        return datetime.now(ZoneInfo(self.config.timezone_name))


def parse_scheduled_times(value: str) -> tuple[dt_time, ...]:
    """
    カンマ区切りの時刻設定をtimeタプルへ変換します。
    @responsibility HH:MM または HH:MM:SS の設定値を検証し、
    昇順に並べた実行時刻へ変換する。
    """
    tokens = [token.strip() for token in value.split(",") if token.strip()]
    parsed: list[dt_time] = []
    for token in tokens:
        parts = token.split(":")
        if len(parts) not in (2, 3):
            raise ValueError(f"Invalid scheduled time: {token}")

        hour, minute = int(parts[0]), int(parts[1])
        second = int(parts[2]) if len(parts) == 3 else 0
        parsed.append(dt_time(hour=hour, minute=minute, second=second))

    return tuple(sorted(parsed))


def resolve_calendar_cache_path(value: str | None = None) -> Path:
    """
    MT5カレンダーJSONのパスを解決します。
    @responsibility 明示パス、MT5共通フォルダ、ローカルfallbackの順に
    監視対象を決める。
    """
    if value:
        return Path(value)

    appdata = os.getenv("APPDATA")
    if appdata:
        return (
            Path(appdata)
            / "MetaQuotes"
            / "Terminal"
            / "Common"
            / "Files"
            / "gold_calendar_cache.json"
        )

    return Path("gold_calendar_cache.json")


def find_due_time(
    now: datetime,
    scheduled_times: tuple[dt_time, ...],
    due_window_seconds: int,
) -> datetime | None:
    """
    実行ウィンドウ内のスケジュール日時を探します。
    @responsibility 深夜またぎも考慮し、今日または前日のスロットが実行対象か判定する。
    """
    target_dates = (now.date(), now.date() - timedelta(days=1))
    for scheduled_time in scheduled_times:
        for target_date in target_dates:
            scheduled_at = datetime.combine(
                target_date,
                scheduled_time,
                tzinfo=now.tzinfo,
            )
            if (
                scheduled_at
                <= now
                < scheduled_at + timedelta(seconds=due_window_seconds)
            ):
                return scheduled_at

    return None


def build_slot_key(slot_date: date, scheduled_time: dt_time) -> str:
    """
    状態ファイル用のスロットキーを生成します。
    @responsibility 同じ日付・時刻のスケジュールを一意に識別する文字列を作る。
    """
    return f"{slot_date.isoformat()}T{scheduled_time.strftime('%H:%M:%S')}"


def hash_file(path: Path) -> str:
    """
    ファイルのSHA-256ハッシュを計算します。
    @responsibility 大きなJSONでもメモリに全読み込みせず内容差分判定用digestを返す。
    """
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_state(path: Path) -> dict:
    """
    前回同期状態を読み込みます。
    @responsibility stateファイルが未作成なら空状態として扱い、
    存在する場合はJSONを復元する。
    """
    if not path.exists():
        return {}

    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_state(path: Path, state: dict) -> None:
    """
    前回同期状態をアトミックに保存します。
    @responsibility 一時ファイルへ完全なJSONを書き出してから置換し、
    書き込み途中のstate破損を避ける。
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        "w",
        encoding="utf-8",
        dir=path.parent,
        delete=False,
    ) as handle:
        json.dump(state, handle, ensure_ascii=True, indent=2, sort_keys=True)
        handle.write("\n")
        temp_path = Path(handle.name)

    temp_path.replace(path)
