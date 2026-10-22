# Shared-flow audit against news_text_visualisation

Compared the original StudyContent stage dispatch, StudyStage, IntroductionPage, dimension/study feedback forms, completion-code page and DebugPanel with the template. Only the template was edited.

| Original shared stage | Template | Configuration / boundary |
| --- | --- | --- |
| ConsentStage | Original consent card and acknowledgement | `study.consent`; formal deployment supplies its own wording/version |
| UsabilityTestStage | Original device-check UI, including resize recheck | `study.screenCheck`; current test is screen size, not general hardware validation |
| IntroStage / IntroductionPage | Original card/navigation/steps, image/video support | `block.introduction`; native video, embedded video, image or video placeholder |
| TrainingStage | Original green task UI and incorrect-answer retry modal | `block.mode = training`, per-quiz answer keys |
| Training-to-task warning | Restored original green notice inside introduction card | Next block's introduction `notice`, bullet list, footer and `startLabel` |
| Condition-change warning | Same configurable notice supports original blue information treatment | `notice.tone = info`; content is experiment-defined, no hard-coded news conditions |
| TaskStage | Original task header, inputs, submit confirmation, timing support | `block.mode = task`, response formats, optional time limits; Demo has no time limit |
| Dimension feedback | Restored original Slide/RatingScale/comment-card UI as block feedback | `block.feedback.pages`, stable field IDs, labels, prompts, required flags |
| StudyFeedbackForm | Same original form UI for study-wide questions | `study.feedback`; note the original form component exists but was not wired in the original StudyContent route |
| CompleteStage / CompletionCodePage | Original green page, thank-you card, code/copy, participant/study metadata | `study.completion` wording; code from environment or completion URL `cc`; Dev uses DEMO-ONLY |
| DebugPanel | Original collapsed red control and floating menu | Dev-only jumps, test reset, storage mode, exports, direct completion preview |

## Behavior retained or intentionally corrected

The final feedback advances directly into completion after persistence. There is no extra routine Finish confirmation. Save failures remain retryable; the template does not copy the original catch-and-advance-on-error behavior. Formal completion still requires all quizzes and configured feedback to have been saved.

Dev may jump straight to Finish with no answers. It renders the same completion component, records `debug-completion-preview`, and does not fabricate answers or a `session-completed` event. The preview remains visibly test-only. Normal fully completed Dev runs still record `session-completed`.

Feedback answers are keyed by field ID, with feedback duration; submission validates both in the form and engine. Back/Next preserves local form state. Unsubmitted feedback drafts and intro-slide position are not saved across refresh, consistent with the original component-local state. Submitted feedback and overall workflow position are durable.

## Verification

A local browser pilot completed consent, device check, intro/video placeholder, two training questions, the training transition, six task formats, block feedback, final feedback and completion. Required feedback validation and Back/Next retention worked. Completion copy reported success. The exported pilot contained 32 events with exactly one final `session-completed` event and both feedback stages; no debug jumps were used in that pilot.

A separate empty test session jumped directly to Finish and displayed the completion preview without the incomplete-quiz error. Automated tests cover that bypass only in Dev and the formal integrity checks.

Build and lint passed; 18 JS tests and the existing Python analysis tests passed. Cloud Auth/rules/deployment and external recruitment return remain unverified against an actual configured project. Local UI verification does not claim pixel-identical parity at all viewports.
