import type { ComponentType, ReactNode } from "react";
import type { Answer, Block, Quiz, Study } from "./types";

/** A plugin owns its experimental UI, not progression, clocks or persistence. */
export interface QuizTaskProps {
  /** Shared question, answer and submit panel. Place it in your experiment layout. */
  children: ReactNode;
  quiz: Quiz;
  block: Block;
  answer: Answer;
  onAnswer: (answer: Answer) => void;
  disabled: boolean;
  /** Call once material has loaded; the framework starts timing at this point. */
  onReady: () => void;
  /** Optional discrete interactions. Await before depending on persistence. */
  onEvent: (name: string, payload: Record<string, unknown>) => Promise<void>;
}
export interface StudyPlugin {
  study: Study;
  Task: ComponentType<QuizTaskProps>;
  Introduction?: ComponentType<{ block: Block; onContinue: () => void }>;
  Feedback?: ComponentType<{
    block?: Block;
    onSubmit: (data: Record<string, unknown>) => void;
  }>;
}
export interface PluginRegistration {
  id: string;
  title: string;
  description: string;
  load: () => Promise<StudyPlugin>;
}
