#!/usr/bin/env python3
"""Validate and flatten the repository's event JSON format into a CSV."""
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any

FIELDS = [
    "run_mode", "event_id", "study_id", "participant_id", "event_type", "occurred_at",
    "route", "mode", "task_index", "item_id", "expected_answer", "answer",
    "reasoning", "confidence", "action", "feedback", "activity_frequency",
    "schema_version", "study_version", "session_id", "block_id", "quiz_id",
    "stimulus_id", "outcome", "duration_ms", "correct", "retry", "condition_json", "payload_json",
]


def load_events(path: Path) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8") as stream:
        data = json.load(stream)
    if not isinstance(data, list):
        raise ValueError("Expected a JSON array of event objects")
    for index, event in enumerate(data):
        if not isinstance(event, dict):
            raise ValueError(f"Event at index {index} must be an object")
        missing = [key for key in ("eventId", "studyId", "participantId", "eventType", "occurredAt", "data") if key not in event]
        if missing:
            raise ValueError(f"Event at index {index} is missing required fields: {', '.join(missing)}")
        version = event.get("schemaVersion", 1)
        if version not in (1, 2):
            raise ValueError(f"Unsupported schema version: {version}")
        if version == 2:
            for key in ("studyVersion", "sessionId"):
                if not isinstance(event.get(key), str) or not event[key]:
                    raise ValueError(f"Version 2 event requires {key}")
        if not isinstance(event["data"], dict):
            raise ValueError(f"Event data at index {index} must be an object")
    return data


def flatten(event: dict[str, Any]) -> dict[str, Any]:
    data = event["data"]
    return {
        "run_mode": event.get("runMode", "unknown"),
        "event_id": event["eventId"],
        "study_id": event["studyId"],
        "participant_id": event["participantId"],
        "event_type": event["eventType"],
        "occurred_at": event["occurredAt"],
        "route": data.get("route", ""),
        "mode": data.get("mode", ""),
        "task_index": data.get("taskIndex", ""),
        "item_id": data.get("itemId", ""),
        "expected_answer": data.get("expectedAnswer", ""),
        "answer": json.dumps(data["answer"], ensure_ascii=False) if isinstance(data.get("answer"), (list, dict)) else data.get("answer", ""),
        "reasoning": data.get("reasoning", ""),
        "confidence": data.get("confidence", ""),
        "action": data.get("action", ""),
        "feedback": json.dumps(data["feedback"], ensure_ascii=False) if isinstance(data.get("feedback"), (list, dict)) else data.get("feedback", ""),
        "activity_frequency": data.get("activityFrequency", ""),
        "schema_version": event.get("schemaVersion", 1),
        "study_version": event.get("studyVersion", ""),
        "session_id": event.get("sessionId", ""),
        "block_id": data.get("blockId", ""),
        "quiz_id": data.get("quizId", ""),
        "stimulus_id": data.get("stimulusId", ""),
        "outcome": data.get("outcome", ""),
        "duration_ms": data.get("durationMs", ""),
        "correct": data.get("correct", ""),
        "retry": data.get("retry", ""),
        "condition_json": json.dumps(data.get("condition", {}), ensure_ascii=False),
        "payload_json": json.dumps(data, ensure_ascii=False) if event.get("schemaVersion") == 2 else "",
    }


def process(input_path: Path, output_path: Path) -> int:
    events = load_events(input_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(flatten(event) for event in events)
    return len(events)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Path to an event JSON array")
    parser.add_argument("--output", type=Path, required=True, help="Destination CSV path")
    args = parser.parse_args()
    try:
        count = process(args.input, args.output)
    except (OSError, json.JSONDecodeError, ValueError) as error:
        parser.error(str(error))
    print(f"Validated {count} events and wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
