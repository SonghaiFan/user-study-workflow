# Study workflow guide

This guide describes the boundaries represented by this repository. Adapt the steps to your discipline, institution, and approved protocol.

## 1. Design the study

Write down the research question, target population, inclusion/exclusion criteria, recruitment method, tasks, measures, analysis plan, and stopping rules. Decide what evidence would answer the question before implementing the interface.

## 2. Prepare participant materials

Set `study.consent` and block instructions in your study plugin. Plugins may also provide introduction and feedback components. Explain the activity, risks, benefits, data collected, withdrawal process, retention, contacts, and ethics approval as required by the institution. The included Demo consent is only a placeholder; it is not approved wording.

## 3. Configure the participant journey

The current reference flow is:

`start → consent acknowledgement → introduction → materials → training → tasks → feedback → completion`

The shared runner is in `src/study/StudyRunner.tsx`. Edit the single Demo component and question configuration under `src/studies/demo/`; see `docs/plugins.md`. Its normal sequence is consent → screen compatibility check → introduction/video guide → training with retries → training-to-task transition → quizzes → block feedback → study feedback → completion. Debug jumps are available only in Dev mode.

## 4. Pilot without real participants

Use fictional IDs and synthetic answers. Check that consent is required, the task sequence is correct, incomplete answers are handled as intended, refresh/back-button behavior is acceptable, and the exported event stream matches the data schema. Test keyboard and screen-reader use at the target viewport sizes.

## 5. Select and secure a real data store

`src/study/store.ts` writes to browser local storage solely to make the demo runnable without credentials or a service. Formal mode uses `src/study/cloudStore.ts`; configure and validate its deployment before a real study. Define who can read and export records, how participants are represented, how failures/retries work, how duplicates are handled, and how long data is retained. Never place privileged credentials in a browser bundle.

## 6. Export and analyse

Export records to a controlled, access-limited location. Run `analysis/process_events.py` on an approved export to validate and flatten event records. Keep raw exports immutable; write derived outputs to a separate ignored folder. Record code version, exclusions, transformations, and analysis decisions.

## 7. Close the study

Follow the protocol for debriefing, participant withdrawal requests, data retention/deletion, and reporting. Remove or archive operational credentials and close collection endpoints when they are no longer needed.
