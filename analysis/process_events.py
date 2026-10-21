#!/usr/bin/env python3
"""Validate and flatten the repository's event JSON format into a CSV."""
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any

FIELDS = [
    "event_id", "study_id", "participant_id", "event_type", "occurred_at",
    "route", "mode", "task_index", "item_id", "expected_answer", "answer",
    "reasoning", "confidence", "action", "feedback", "activity_frequency",
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
        if not isinstance(event["data"], dict):
            raise ValueError(f"Event data at index {index} must be an object")
    return data


def flatten(event: dict[str, Any]) -> dict[str, Any]:
    data = event["data"]
    return {
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
        "answer": data.get("answer", ""),
        "reasoning": data.get("reasoning", ""),
        "confidence": data.get("confidence", ""),
        "action": data.get("action", ""),
        "feedback": data.get("feedback", ""),
        "activity_frequency": data.get("activityFrequency", ""),
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
