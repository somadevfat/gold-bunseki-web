import json
import tempfile
import unittest
from datetime import datetime, time
from pathlib import Path
from zoneinfo import ZoneInfo

from scheduled_sync import (
    JsonDiffSyncScheduler,
    ScheduledSyncConfig,
    build_slot_key,
    find_due_time,
    hash_file,
    parse_scheduled_times,
    read_state,
)


class JsonDiffSyncSchedulerTest(unittest.TestCase):
    def test_parse_scheduled_times_sorts_multiple_times(self):
        # ## Arrange ##
        value = "21:30, 08:00:15"

        # ## Act ##
        parsed = parse_scheduled_times(value)

        # ## Assert ##
        self.assertEqual(parsed, (time(8, 0, 15), time(21, 30)))

    def test_evaluate_once_posts_when_due_calendar_changed(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            # ## Arrange ##
            tmp = Path(tmpdir)
            calendar_path = tmp / "gold_calendar_cache.json"
            state_path = tmp / "state.json"
            calendar_path.write_text('[{"name":"CPI"}]', encoding="utf-8")
            calls = []
            now = datetime(2026, 5, 6, 8, 0, 30, tzinfo=ZoneInfo("Asia/Tokyo"))
            config = ScheduledSyncConfig(
                scheduled_times=(time(8, 0),),
                calendar_path=calendar_path,
                state_path=state_path,
            )
            scheduler = JsonDiffSyncScheduler(
                config, sync_callback=lambda: calls.append("sync")
            )

            # ## Act ##
            result = scheduler.evaluate_once(now)

            # ## Assert ##
            self.assertEqual(result.status, "synced")
            self.assertEqual(calls, ["sync"])
            self.assertEqual(
                read_state(state_path),
                {
                    "last_calendar_hash": hash_file(calendar_path),
                    "last_slot_key": "2026-05-06T08:00:00",
                    "last_status": "synced",
                    "last_synced_at": now.isoformat(),
                },
            )

    def test_evaluate_once_skips_when_due_calendar_unchanged(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            # ## Arrange ##
            tmp = Path(tmpdir)
            calendar_path = tmp / "gold_calendar_cache.json"
            state_path = tmp / "state.json"
            calendar_path.write_text('[{"name":"CPI"}]', encoding="utf-8")
            now = datetime(2026, 5, 6, 8, 0, 30, tzinfo=ZoneInfo("Asia/Tokyo"))
            state_path.write_text(
                json.dumps(
                    {
                        "last_calendar_hash": hash_file(calendar_path),
                        "last_slot_key": "2026-05-05T08:00:00",
                    }
                ),
                encoding="utf-8",
            )
            calls = []
            config = ScheduledSyncConfig(
                scheduled_times=(time(8, 0),),
                calendar_path=calendar_path,
                state_path=state_path,
            )
            scheduler = JsonDiffSyncScheduler(
                config, sync_callback=lambda: calls.append("sync")
            )

            # ## Act ##
            result = scheduler.evaluate_once(now)

            # ## Assert ##
            self.assertEqual(result.status, "unchanged")
            self.assertEqual(calls, [])
            self.assertEqual(
                read_state(state_path)["last_slot_key"], "2026-05-06T08:00:00"
            )

    def test_evaluate_once_skips_already_processed_slot(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            # ## Arrange ##
            tmp = Path(tmpdir)
            calendar_path = tmp / "gold_calendar_cache.json"
            state_path = tmp / "state.json"
            calendar_path.write_text('[{"name":"CPI"}]', encoding="utf-8")
            now = datetime(2026, 5, 6, 8, 0, 30, tzinfo=ZoneInfo("Asia/Tokyo"))
            slot_key = build_slot_key(now.date(), time(8, 0))
            state_path.write_text(
                json.dumps({"last_slot_key": slot_key}),
                encoding="utf-8",
            )
            calls = []
            config = ScheduledSyncConfig(
                scheduled_times=(time(8, 0),),
                calendar_path=calendar_path,
                state_path=state_path,
            )
            scheduler = JsonDiffSyncScheduler(
                config, sync_callback=lambda: calls.append("sync")
            )

            # ## Act ##
            result = scheduler.evaluate_once(now)

            # ## Assert ##
            self.assertEqual(result.status, "already_processed")
            self.assertEqual(calls, [])

    def test_evaluate_once_is_idle_outside_due_window(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            # ## Arrange ##
            tmp = Path(tmpdir)
            calendar_path = tmp / "gold_calendar_cache.json"
            state_path = tmp / "state.json"
            calendar_path.write_text('[{"name":"CPI"}]', encoding="utf-8")
            calls = []
            config = ScheduledSyncConfig(
                scheduled_times=(time(8, 0),),
                calendar_path=calendar_path,
                state_path=state_path,
                due_window_seconds=90,
            )
            scheduler = JsonDiffSyncScheduler(
                config, sync_callback=lambda: calls.append("sync")
            )

            # ## Act ##
            result = scheduler.evaluate_once(
                datetime(2026, 5, 6, 8, 2, 0, tzinfo=ZoneInfo("Asia/Tokyo"))
            )

            # ## Assert ##
            self.assertEqual(result.status, "idle")
            self.assertEqual(calls, [])

    def test_find_due_time_detects_previous_day_slot_across_midnight(self):
        # ## Arrange ##
        now = datetime(2026, 5, 7, 0, 0, 10, tzinfo=ZoneInfo("Asia/Tokyo"))

        # ## Act ##
        due_at = find_due_time(now, (time(23, 59, 50),), 30)

        # ## Assert ##
        self.assertEqual(
            due_at,
            datetime(2026, 5, 6, 23, 59, 50, tzinfo=ZoneInfo("Asia/Tokyo")),
        )


if __name__ == "__main__":
    unittest.main()
