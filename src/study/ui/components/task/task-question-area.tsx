import React from "react";
import { Brain, AlertCircle } from "lucide-react";
import { QuizItem } from "./quiz-types"; // Adjust path as needed

interface TaskQuestionAreaProps {
  currentTask: Pick<QuizItem, "id" | "question" | "questionCaption"> & {
    notice?: string;
  } & Partial<Pick<QuizItem, "level" | "prone">>;
  currentTaskIndex: number;
  isDomainExpert: boolean;
}

const getLevelColor = (level?: string) => {
  if (!level) return "bg-gray-100 text-gray-600";
  switch (level) {
    case "1":
      return "bg-blue-100 text-blue-700";
    case "2":
      return "bg-green-100 text-green-700";
    case "3":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

const parseTextWithBrackets = (text: string) => {
  // Split by newlines first
  const lines = text.split("\\n");

  return lines.map((line, lineIndex) => {
    // For each line, find text in brackets and make it bold
    const parts = line.split(/(\[.*?\])/);

    return (
      <React.Fragment key={lineIndex}>
        {lineIndex > 0 && <br />}
        {parts.map((part, partIndex) => {
          if (part.startsWith("[") && part.endsWith("]")) {
            // Remove the brackets and make the text bold
            const textWithoutBrackets = part.slice(1, -1);
            return (
              <span key={partIndex} className="font-bold">
                {textWithoutBrackets}
              </span>
            );
          }
          return part;
        })}
      </React.Fragment>
    );
  });
};

const parseQuestionCaption = (text: string) => {
  // Split by newlines and render each as a separate div
  // Handle both literal \n and actual newline characters
  const lines = text.split(/\\n|\n/);

  return lines
    .map((line, lineIndex) => {
      // Skip empty lines
      if (line.trim() === "") return null;

      // For each line, find text in brackets and make it bold
      const parts = line.split(/(\[.*?\])/);

      return (
        <div key={lineIndex} className="text-xs text-gray-500 mt-1">
          {parts.map((part, partIndex) => {
            if (part.startsWith("[") && part.endsWith("]")) {
              // Remove the brackets and make the text bold
              const textWithoutBrackets = part.slice(1, -1);
              return (
                <span key={partIndex} className="font-bold">
                  {textWithoutBrackets}
                </span>
              );
            }
            return part;
          })}
        </div>
      );
    })
    .filter(Boolean); // Remove null entries from empty lines
};

export function TaskQuestionArea({
  currentTask,
  currentTaskIndex,
  isDomainExpert,
}: TaskQuestionAreaProps) {
  if (!currentTask) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {isDomainExpert && currentTask.level && (
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            <div
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] ${getLevelColor(
                currentTask.level,
              )}`}
            >
              <Brain className="h-2.5 w-2.5 mr-0.5" />
              <span>{currentTask.level}</span>
            </div>
            {currentTask.prone && (
              <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700">
                <span className="font-medium">prone:</span>
                <span className="ml-1">{currentTask.prone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-3">
        <div className="flex flex-col">
          <div className="text-xs text-gray-500 mb-1.5">
            Question {currentTaskIndex + 1}:
          </div>
          <div className="text-normal font-medium text-gray-900">
            {parseTextWithBrackets(currentTask.question)}
          </div>
          {currentTask.questionCaption && (
            <>{parseQuestionCaption(currentTask.questionCaption)}</>
          )}
        </div>
      </div>

      {currentTask.notice && (
        <div className="px-3 pb-3">
          <div className="space-y-2">
            <div className="bg-red-50 border border-red-200 rounded-md p-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-800">{currentTask.notice}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
