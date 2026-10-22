/** Framework contracts. No experiment, router or storage SDK dependencies. */
export type Answer = string | string[] | number | Record<string, string> | null;
export interface Option {
  id: string;
  label: string;
  image?: string;
}
export type ResponseDefinition =
  | { type: "single-choice" | "multiple-choice" | "ranking"; options: Option[] }
  | { type: "text"; maxLength?: number }
  | { type: "rating"; min: number; max: number }
  | { type: "pairing"; options: Option[]; targets: Option[] };
export interface Quiz {
  id: string;
  question: string;
  description?: string;
  notice?: string;
  stimulusId: string;
  response: ResponseDefinition;
  required?: boolean;
  allowSkip?: boolean;
  timeLimitSeconds?: number;
  correctAnswer?: Answer;
  explanation?: string;
  collectReasoning?: boolean;
  collectConfidence?: boolean;
}
export interface IntroductionSlide {
  title: string;
  content: string;
  video?: { src?: string; label: string; kind?: "file" | "embed" };
  image?: { src: string; alt: string };
  notice?: { tone: "success" | "info"; heading: string; content: string; bullets?: string[] };
  footer?: string;
}
export interface FeedbackField {
  id: string;
  label: string;
  description?: string;
  response: ResponseDefinition;
  required?: boolean;
  leftLabel?: string;
  rightLabel?: string;
  placeholder?: string;
  prompts?: string[];
}
export interface FeedbackDefinition {
  pages: { title: string; subtitle?: string; fields: FeedbackField[] }[];
  submitLabel: string;
  footer?: string;
}
export interface CompletionDefinition {
  title: string;
  description: string;
  codeLabel: string;
  instructions: string;
  returnLabel: string;
  footer: string;
}
export interface Block {
  id: string;
  title: string;
  instructions: string;
  introduction?: IntroductionSlide[];
  mode: "training" | "task";
  condition?: Record<string, string>;
  order?: "fixed" | "shuffle";
  feedback?: boolean | FeedbackDefinition;
  startLabel?: string;
  quizzes: Quiz[];
}
export interface Study {
  id: string;
  version: string;
  title: string;
  description: string;
  consent: { version: string; text: string };
  screenCheck?: boolean;
  feedback?: FeedbackDefinition | false;
  completion?: CompletionDefinition;
  blocks: Block[];
}
export interface Recruitment {
  platform: "demo" | "prolific";
  participantId: string;
  studyId?: string;
  sessionId?: string;
}
export interface StudyEvent {
  runMode?: "dev" | "study";
  schemaVersion: 2;
  eventId: string;
  studyId: string;
  studyVersion: string;
  sessionId: string;
  participantId: string;
  eventType: string;
  occurredAt: string;
  data: Record<string, unknown>;
}
export interface Submission {
  answer: Answer;
  outcome: "answered" | "skipped" | "timed-out";
  reasoning?: string;
  confidence?: number;
}
export interface Session {
  runMode?: "dev" | "study";
  schemaVersion: 2;
  id: string;
  studyId: string;
  studyVersion: string;
  recruitment: Recruitment;
  revision: number;
  cursor: number;
  orders: Record<string, string[]>;
  presentedAt: Record<string, number>;
  responses: Record<string, Submission>;
  events: StudyEvent[];
  completed: boolean;
}
export type Step =
  | { kind: "block-intro" | "block-feedback"; block: Block }
  | { kind: "quiz"; block: Block; quiz: Quiz }
  | { kind: "screen-check" | "study-feedback" | "finish" };
export interface StudyStore {
  readonly mode: "demo" | "cloud";
  load(key: string): Promise<Session | null>;
  /** Atomically persist events AND progress; reject stale revisions and failures. */
  save(
    key: string,
    next: Session,
    expectedRevision: number | null,
  ): Promise<void>;
}
