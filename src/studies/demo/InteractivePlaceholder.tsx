import { useState } from "react";
import type { StudyComponentProps } from "../../study/defineStudy";

/** Replace this component with the interactive material for your experiment. */
export function InteractivePlaceholder({ disabled }: StudyComponentProps) {
  const [count, setCount] = useState(0);
  return (
    <section className="h-full flex flex-col items-center justify-center gap-6 p-8" aria-label="Interactive component">
      <h2 className="text-lg font-semibold text-gray-900">Click counter</h2>
      <p className="text-4xl font-semibold text-gray-900" aria-live="polite" aria-atomic="true">Count: {count}</p>
      <button type="button" disabled={disabled} className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" onClick={() => setCount((value) => value + 1)}>Click me</button>
    </section>
  );
}
