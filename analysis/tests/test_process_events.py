import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1]))
from process_events import FIELDS, load_events, process


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


if __name__ == "__main__":
    unittest.main()
