// Types
export type QuizLevel = "1" | "2" | "3";

export type QuizType =
  | "single-select"
  | "sequence-rank"
  | "drag-pairing"
  | "multiple-select"
  | "single-input";

export type QuizVisual = "entity" | "topic" | "time" | null;

export type QuizProne = "entity" | "topic" | "time" | null;

interface BaseQuizItem {
  id: string;
  question: string;
  questionCaption?: string;
  answer: string;
  level: QuizLevel;
  completed: boolean;
  type: QuizType;
  prone: QuizProne;
  visual: QuizVisual;
  event_reference: number | number[] | null;
  timeLimit?: number;
  completionTime?: number;
  startTimestamp?: number;
  submitTimestamp?: number;
  userAnswer?: string;
  userEventReference?: number | number[] | null;
  isTimeExpired?: boolean;
}

export interface MultipleSelectQuiz extends BaseQuizItem {
  type: "multiple-select";
  options: string[];
}

export interface SingleSelectQuiz extends BaseQuizItem {
  type: "single-select";
  options: string[];
}

export interface SequnceRankQuiz extends BaseQuizItem {
  type: "sequence-rank";
  options: {
    events: Array<{ id: number; text: string }>;
  };
}

export interface DragPairingQuiz extends BaseQuizItem {
  type: "drag-pairing";
  options: {
    leftItems: string[];
    rightItems: string[];
    leftLabel?: string;
    rightLabel?: string;
  };
}

export type QuizItem =
  | MultipleSelectQuiz
  | SingleSelectQuiz
  | SequnceRankQuiz
  | DragPairingQuiz;

export interface Quiz {
  quiz: QuizItem[];
}

