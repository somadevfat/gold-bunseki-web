from __future__ import annotations

import hashlib
import json
import os
import threading
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from datetime import time as dt_time
from pathlib import Path
from zoneinfo import ZoneInfo

DEFAULT_TIMEZONE = "Asia/Tokyo"
DEFAULT_POLL_SECONDS = 30
DEFAULT_DUE_WINDOW_SECONDS = 90


@dataclass(frozen=True)
class ScheduledSyncConfig:
    scheduled_times: tuple[dt_time, ...]
    calendar_path: Path
    state_path: Path
    timezone_name: str = DEFAULT_TIMEZONE
    poll_seconds: int = DEFAULT_POLL_SECONDS
    due_window_seconds: int = DEFAULT_DUE_WINDOW_SECONDS

    @classmethod
    def from_env(cls) -> "ScheduledSyncConfig | None":
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
    status: str
    message: str
    slot_key: str | None = None
    calendar_hash: str | None = None


class JsonDiffSyncScheduler:
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
        if self._thread and self._thread.is_alive():
            return

        self._thread = threading.Thread(
            target=self._run_loop,
            name="scheduled-json-sync",
            daemon=True,
        )
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=5)

    def evaluate_once(self, now: datetime | None = None) -> ScheduledSyncResult:
        current = now or self.now_provider()
        due_time = find_due_time(
            current,
            self.config.scheduled_times,
            self.config.due_window_seconds,
        )
        if due_time is None:
            return ScheduledSyncResult("idle", "No scheduled sync slot is due.")

        slot_key = build_slot_key(current, due_time)
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
        return datetime.now(ZoneInfo(self.config.timezone_name))


def parse_scheduled_times(value: str) -> tuple[dt_time, ...]:
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
) -> dt_time | None:
    for scheduled_time in scheduled_times:
        scheduled_at = datetime.combine(
            now.date(),
            scheduled_time,
            tzinfo=now.tzinfo,
        )
        if scheduled_at <= now < scheduled_at + timedelta(seconds=due_window_seconds):
            return scheduled_time

    return None


def build_slot_key(now: datetime, scheduled_time: dt_time) -> str:
    return f"{now.date().isoformat()}T{scheduled_time.strftime('%H:%M:%S')}"


def hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_state(path: Path) -> dict:
    if not path.exists():
        return {}

    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_state(path: Path, state: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(state, handle, ensure_ascii=True, indent=2, sort_keys=True)
        handle.write("\n")
