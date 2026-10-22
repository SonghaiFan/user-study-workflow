# Runtime modes and data isolation

`src/study/runtime.ts` reads build configuration. The default Vite dev server runs `dev`; production builds default to `study`. An explicit `VITE_RUN_MODE` selects a deployment, not a participant session. Neither `?debug=true` nor `?mode=dev` changes this. Publish debug builds separately from recruitment URLs.

## Dev

Dev uses synthetic identities even when a Prolific URL is supplied. Local records use a `dev:` storage namespace and `dev:` session keys. A tab's test ID is retained in sessionStorage to resume after refresh. The extracted Debug Panel offers step jumps, new tests, storage checks, event export, and persistence on/off. Jumps produce `debug-jump` events. A jump before consent creates a synthetic session; none of those records are participant consent evidence.

Persistence off means in-memory storage. It starts a new test and never deletes the previously saved test. Toggling it on also starts a new test.

To exercise the cloud adapter, configure `VITE_DEV_STORAGE=cloud` and all `VITE_DEV_FIREBASE_*` settings. Use a separate Firebase project with `firestore.dev.rules` via `firebase.dev.json`. There is no fallback to `VITE_STUDY_FIREBASE_*`; matching configured project IDs are rejected. Storage checks read the current session from the server, including missing-session permission checks, but do not prove write permission.

## Formal Study

Configure:

- `VITE_RUN_MODE=study` (or leave unset for a production build).
- `VITE_STUDY_FIREBASE_API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `APP_ID` (each with the `VITE_STUDY_FIREBASE_` prefix).
- `VITE_STUDY_CONSENT_TEXT` and `VITE_STUDY_CONSENT_VERSION` for this study.
- `VITE_COMPLETION_URL`, an HTTPS recruitment return URL.

Enable Firebase Anonymous Auth and Firestore. Deploy `firestore.rules` to the formal project. Configure the hosting domain in Firebase Auth. Vite Firebase web configuration is public application configuration; do not put service-account credentials in it.

Participants must launch with `PROLIFIC_PID`, `STUDY_ID`, `SESSION_ID`. Anonymous Auth owns the record; recruitment parameters label it. These parameters are **not verified Prolific identity**. Clearing browser authentication or switching devices does not automatically recover the old record; cross-device recovery and server-side recruitment verification are outside this template.

No debug panel, example selector, jump, reset, data toggle or participant JSON-export control appears in Study mode. The normal flow saves via a Firestore transaction. Failed writes retain the current visible progress and surface an error. Completion is shown only after the final transaction resolves; then the participant can use the configured return link. The client-return link is not a fraud-resistant server-issued completion proof.

## Storage contract

- Test cloud: `testSessions/{authUid}/sessions/{sha256(sessionKey)}` in the test project.
- Formal cloud: `studySessions/{authUid}/sessions/{sha256(sessionKey)}` in the formal project.
- Envelopes include owner UID, runMode, revision, study identity and a JSON session payload. JSON preserves structured answers without Firestore nested-array restrictions.
- Rules allow owners to get their own record and create/update with sequential revisions. Listing, deletion and cross-owner access are denied. Each project's rules reject the other collection.
- The transaction compares the expected revision, then writes progress and events together. Server reads are required; no persistent Firestore offline cache or local fallback is enabled.
- Snapshots reject payloads above 900 KB to stay within Firestore's document limit. This is a small-study template; high-volume interaction traces need a separate event collection/backend.
- Client payloads and timing are not trusted server attestations. Rules protect ownership and collection boundaries, not research answer integrity.
- Snapshots and exported events carry `runMode`; CSV exports carry `run_mode`. Older missing metadata is `unknown`.

The adapter follows Firebase's [transaction](https://firebase.google.com/docs/firestore/manage-data/transactions) and [anonymous-auth](https://firebase.google.com/docs/auth/web/anonymous-auth) APIs. Actual Auth, rules enforcement, cloud persistence and recruitment return must be verified against your configured test project before launch. No real project has been deployed or exercised here.

Dev completion preview: jumping to Finish bypasses missing quizzes/feedback and logs `debug-completion-preview`. It displays the real completion layout with DEMO-ONLY code and never fabricates task responses. Formal mode does not permit this bypass. `VITE_COMPLETION_CODE` optionally overrides the completion URL’s `cc` value.
