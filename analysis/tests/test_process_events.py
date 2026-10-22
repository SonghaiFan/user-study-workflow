import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1]))
from process_events import FIELDS, load_events, process, flatten


class ProcessEventsTests(unittest.TestCase):
    def setUp(self):
        self.sample = Path(__file__).parents[1] / "data/sample/demo-events.json"

    def test_sample_exports_expected_rows_and_columns(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "events.csv"
            self.assertEqual(process(self.sample, output), 4)
            rows = output.read_text(encoding="utf-8").splitlines()
            self.assertEqual(len(rows), 5)
            self.assertEqual(rows[0].split(","), FIELDS)
            self.assertIn("demo-001", rows[1])

    def test_rejects_missing_required_fields(self):
        with tempfile.TemporaryDirectory() as directory:
            bad = Path(directory) / "bad.json"
            bad.write_text(json.dumps([{"eventId": "x"}]), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "missing required fields"):
                load_events(bad)

    def test_v2_preserves_conditions_timing_and_structured_answers(self):
        event = {"schemaVersion": 2, "eventId": "e", "studyId": "study", "studyVersion": "1", "sessionId": "s", "participantId": "demo", "eventType": "quiz-submitted", "occurredAt": "2026-10-22T00:00:00Z", "data": {"blockId": "b", "quizId": "q", "answer": ["b", "a"], "durationMs": 300, "condition": {"treatment": "visual"}, "custom": {"clicks": 2}}}
        row = flatten(event)
        self.assertEqual(json.loads(row["answer"]), ["b", "a"])
        self.assertEqual(row["duration_ms"], 300)
        self.assertEqual(json.loads(row["condition_json"])["treatment"], "visual")
        self.assertEqual(json.loads(row["payload_json"])["custom"]["clicks"], 2)
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "events.json"
            source.write_text(json.dumps([event]))
            self.assertEqual(len(load_events(source)), 1)
            event["schemaVersion"] = 3
            source.write_text(json.dumps([event]))
            with self.assertRaisesRegex(ValueError, "Unsupported schema"):
                load_events(source)


if __name__ == "__main__":
    unittest.main()
