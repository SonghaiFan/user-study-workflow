# Event data schema

The shared framework exports an array of version 2 events. Original narrative demo exports without `schemaVersion` remain supported as version 1.

| Field | Meaning |
| --- | --- |
| `schemaVersion` | `2` for the shared framework. Unknown versions are rejected by the exporter. |
| `eventId` | Random event identifier; retained on persistence retry. |
| `studyId`, `studyVersion` | Study definition identity and version. |
| `sessionId` | Internal framework session identity; distinct from platform IDs. |
| `participantId` | Recruitment/demo identifier. Do not treat a platform ID as authentication. |
| `eventType` | Consent, session start, quiz presentation/submission, step completion, feedback, plugin interaction or session completion. |
| `occurredAt` | Client-generated ISO timestamp. Local demo has no authoritative server clock. |
| `data` | Event-specific payload. |

Quiz submissions include `blockId`, `quizId`, `stimulusId`, `mode`, `condition`, `answer`, `outcome`, `durationMs`, and optional correctness, reasoning and confidence. Wrong training attempts have `retry: true`; the accepted response is a later event. Count accepted submissions, not all attempts, when computing task totals. Outcomes are `answered`, `skipped` and `timed-out`.

Timing starts when the plugin signals material readiness for each quiz. It includes reload/time away and retry time. Local timestamps are not tamper resistant and do not measure active attention.

Session-start events record the chosen question order. Conditions live in each block definition and are included in quiz events. Plugin `onEvent` payloads are attributed to the active block and quiz.

The CSV exporter preserves original narrative columns and adds version, session, block, quiz, stimulus, outcome, duration, correctness, retry, condition JSON and full v2 payload JSON. Structured answers are JSON-encoded. V1 unknown fields are not copied. **V2 plugin payloads are preserved**: review payload contents before collection/export rather than relying on the exporter to strip them.

Local session snapshots also contain recruitment metadata, progress and accepted responses; the browser download exports events only. Study changes require a version increment. Draft answers are not saved. See [plugin persistence rules](plugins.md#persistence-and-timing).

Current runs also include top-level `runMode` (`dev` or `study`) in sessions and events. CSV exposes it as `run_mode`; historical missing values are `unknown`. Do not confuse this with per-block `mode` (`training` or `task`). Debug navigation is logged as `debug-jump`, with a synthetic flag and source/destination cursor. Formal data lives in its own Firebase project and collection; see [runtime modes](runtime-modes.md).

Configured feedback events store `{ answers: { [fieldId]: answer }, feedbackDuration }` under `data.feedback`. `debug-completion-preview` denotes a Dev-only completion layout preview without all task/feedback submissions; it is distinct from `session-completed`.
