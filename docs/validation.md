# Validation scope

The current template has one Demo with separate component and quiz configuration. Engine tests cover ordering/resume, timing, retries, validation, idempotency and failed writes. Runtime tests cover build-mode selection, fail-closed formal configuration, test/formal identity and storage isolation, and debug navigation guards.

Local build, lint and tests do not validate a cloud deployment. Firebase Auth, deployed Firestore rules, real cloud persistence and recruitment return have not been verified against a configured project. No production deployment has been made.

Browser verification: fresh consent → screen check → block intro → quiz; counter increment; pairing removes matched items from source and restores them on removal; Debug jumps and refresh recovery. Production preview with `?debug=true&mode=dev` still refuses missing formal configuration. Adapter tests use a mocked transport, not deployed rules.
