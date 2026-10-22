import type { ReactNode } from "react";
import type { Block } from "../types";

/** Extracted from news_text_visualisation's StudyStage: same header and 70/30 panels. */
export function ExperimentLayout({
  block,
  stimulus,
  children,
}: {
  block: Block;
  stimulus?: ReactNode;
  children: ReactNode;
}) {
  const training = block.mode === "training";
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div
        className={`border-b px-4 py-4 flex items-center justify-between flex-shrink-0 border-gray-200 ${training ? "bg-gradient-to-br from-green-50 to-emerald-100" : "bg-gradient-to-br from-purple-50 to-violet-100"}`}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">{block.title}</h1>
          {block.condition?.treatment && (
            <span className="text-sm text-gray-600">
              • {block.condition.treatment}
            </span>
          )}
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${training ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"}`}
          >
            {training ? "Training Session" : "Task Session"}
          </span>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {stimulus != null && (
          <div className="flex-[7] min-w-0 bg-white border-r border-gray-200 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden">{stimulus}</div>
            </div>
          </div>
        )}
        <div className="flex-[3] min-w-0 bg-white overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
