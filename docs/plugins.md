# Component and question configuration

The template has one Demo. Edit `src/studies/demo/InteractivePlaceholder.tsx` and `src/studies/demo/study.ts`. Their binding stays:

```tsx
import { defineStudy } from '../../study/defineStudy';
import { InteractivePlaceholder } from './InteractivePlaceholder';
import { study } from './study';
export const plugin = defineStudy({ study, Component: InteractivePlaceholder });
```

The left component receives `quiz`, `block`, `disabled`, and `onEvent`. The framework renders the shared 70/30 layout and the right answer/submit panel. Independent question configuration supports `single-choice`, `multiple-choice`, `ranking`, `pairing`, `rating`, and `text`. Option IDs are stable data identifiers, separate from display labels. Pairing maps each item to one target; several items may share a target.

The right panel reuses the original news SingleSelect, MultipleSelect, SequnceRank, DragPairing, TextInput and RatingScale components. No research-specific story, article, visualisation or tutorial remains as an example.

## Persistence and timing

`defineStudy` starts timing when the synchronous material mounts. For asynchronous material, use the advanced `StudyPlugin.Task` contract, call `onReady` after loading succeeds, and place the supplied `children` inside `ExperimentLayout`. `Task` receives `quiz`, `block`, `children`, `answer`, `onAnswer`, `disabled`, `onReady`, and `onEvent`.

The framework serializes saves before advancing. Draft inputs are not persisted. The component remains mounted across quizzes; reset question-specific state on quiz ID changes if needed. Await `onEvent` when subsequent work depends on its persistence. Only log discrete, necessary interaction data; cloud snapshots have a bounded size.

Study ID, version and consent version identify saved sessions. Increment the study version when changing questions, ordering or answer semantics. Runtime mode and recruitment identity further separate session keys. See [runtime modes](runtime-modes.md) for test/formal storage.

## Introduction and tutorial

Set `block.introduction` to ordered slides with `title` and `content`. A slide with `video: { label: "Tutorial video placeholder" }` shows a placeholder; add `src` pointing to a browser-playable video file to replace it. The last slide starts training (or tasks). The Demo includes these slides before the training questions.

## Transitions, feedback and completion

- An introduction slide's `notice` supplies `tone: success | info`, `heading`, `content` and optional `bullets`. Use it for the training-to-task or condition-change announcement. `block.startLabel` controls the final action label.
- `block.feedback` accepts a feedback definition (or `true` for the generic fallback). `study.feedback` accepts the same definition; set it to `false` to omit study-wide feedback. Definitions contain `pages`, each with a title/subtitle and fields; fields have a stable `id`, `label`, `response`, optional description/prompts, scale endpoint labels and `required` (default true). `submitLabel` and `footer` configure the last page.
- `study.completion` configures completion title, description, code heading, platform instructions, return-button label and footer. Set `VITE_COMPLETION_CODE`, or use the `cc` query value in `VITE_COMPLETION_URL`. Dev always displays a visibly synthetic preview code.
- `block.introduction` images use `{ src, alt }`. A video with `kind: embed` renders an iframe; otherwise `src` is a playable video file. Missing `src` renders the placeholder.

See [shared-flow audit](flow-audit.md) for original source mappings and validation limits.
