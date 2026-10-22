import { useEffect, type ComponentType } from "react";
import type { QuizTaskProps, StudyPlugin } from "./plugin";
import type { Study } from "./types";
import { ExperimentLayout } from "./ui/ExperimentLayout";

/** Left-side components never receive or render the shared answer panel. */
export type StudyComponentProps = Pick<QuizTaskProps, "quiz" | "block" | "disabled" | "onEvent">;

/** Bind independent material and question configuration to the standard study shell. */
export function defineStudy({ study, Component }: {
  study: Study;
  Component: ComponentType<StudyComponentProps>;
}): StudyPlugin {
  function Task({ children, onReady, quiz, block, disabled, onEvent }: QuizTaskProps) {
    useEffect(onReady, [onReady]);
    return (
      <ExperimentLayout block={block} stimulus={<Component quiz={quiz} block={block} disabled={disabled} onEvent={onEvent} />}>
        {children}
      </ExperimentLayout>
    );
  }
  return { study, Task };
}
