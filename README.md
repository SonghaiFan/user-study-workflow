# User Study Workflow Template

A single **Demo** built around **Study → Block → Quiz**. Replace the left React component and configure the right questions; consent, timing, validation, progress, storage and completion stay in the framework. The 70/30 UI, input controls and Debug Panel are extracted from `news_text_visualisation`.

## Develop

```bash
npm ci
npm run dev
```

The root URL opens the only Demo: consent → device compatibility check (800 × 600 minimum) → introduction and tutorial video placeholder → training (answer checking and retries) → main block introduction → quizzes → block feedback → study feedback → completion. A saved session resumes its current step; **New test / Consent** in Debug starts a fresh run. There is no example selector. Previous `?example=...` links also open this Demo.

Edit these two files for a new experiment:

- `src/studies/demo/InteractivePlaceholder.tsx`: left interactive component, currently a simple click counter.
- `src/studies/demo/study.ts`: blocks and quizzes. Supports single choice, multiple choice, drag ranking, drag pairing, rating and text.

`src/studies/demo/index.tsx` binds them with `defineStudy({ study, Component })`. No framework changes are required. See [component contract](docs/plugins.md).

## Two runtime modes

| | Dev / Debug | Study |
|---|---|---|
| Selection | `npm run dev` or explicit `VITE_RUN_MODE=dev` | production build default or `VITE_RUN_MODE=study` |
| UI | Original floating DEBUG panel | Participant flow only |
| Navigation | Jump to any step; start another test | Follow configured sequence |
| Identity | Synthetic test ID; ignores recruitment URL IDs | Requires Prolific's three launch IDs |
| Storage | Local test namespace; optional separate test Firebase | Formal Firebase only; no local fallback |
| Completion | Test JSON export | Recruitment return link after server save |

The debug panel can test storage access and turn test persistence off (memory-only session). Toggling storage or starting a new test preserves previous saved tests and creates a new session. Refresh resumes saved answers, but not draft answers. Use one tab per local test session.

Mode is build configuration, never a URL switch. Block `mode: training/task` is independent of runtime `dev/study`.

## Formal study setup

Copy `.env.example` to your ignored local environment file and configure your own Firebase web app, consent text/version and HTTPS completion URL. Enable Anonymous Auth and deploy `firestore.rules` to the **formal** Firebase project. Production participant records are owner-scoped in `studySessions/{authUid}/sessions/{key}`.

```bash
npm run build:study
# After configuring your own Firebase project:
# firebase deploy --project YOUR_FORMAL_PROJECT --only firestore:rules,hosting
```

For cloud testing use a **different Firebase project**, `VITE_DEV_STORAGE=cloud`, and only the `VITE_DEV_FIREBASE_*` settings. Deploy `firestore.dev.rules` using `firebase.dev.json`. This project accepts `testSessions` and rejects formal collection writes; formal rules reject test collection writes. Never deploy both rule sets into the same project.

No Firebase project credentials were copied and no cloud resources were deployed by this extraction. Missing formal settings stop the participant flow. A successful build does not establish a working cloud deployment. See [deployment and storage details](docs/runtime-modes.md).

## Validate

```bash
npm run build
npm run lint:starter
npm test
python3 -m unittest discover -s analysis/tests -v
python3 analysis/process_events.py path/to/events.json --output /tmp/study-events.csv
```

Exports include `run_mode` so test data can be excluded from analysis. Earlier records without that field are `unknown`, never inferred as formal data.

The original training transition, feedback slides and completion-code UI are configurable in `study.ts`. See [shared-flow audit](docs/flow-audit.md) for the complete comparison. Dev can preview Finish directly without answering tasks.
