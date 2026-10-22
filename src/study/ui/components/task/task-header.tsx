
import { Timer, AlertCircle } from "lucide-react";
import { QuizItem } from "./quiz-types"; // Adjust path as needed

interface TaskHeaderProps {
  isTraining: boolean;
  showTimer?: boolean;
  completedTasksCount: number;
  totalTasksCount: number;
  currentTaskIndex: number;
  currentTaskTimeLeftFormatted: string | null;
  currentTaskTimerColorClass: string;
  isDomainExpert: boolean;
  onDotClick?: (index: number) => void; // Optional: for navigating by dots
  tasksForDots: Pick<QuizItem, "id" | "completed">[]; // Only need id and completed status for dots
}

export function TaskHeader({
  isTraining,
  showTimer = true,
  completedTasksCount,
  totalTasksCount,
  currentTaskIndex,
  currentTaskTimeLeftFormatted,
  currentTaskTimerColorClass,
  isDomainExpert,
  onDotClick,
  tasksForDots,
}: TaskHeaderProps) {
  return (
    <>
      {/* Floating Timer */}
      {!isTraining && showTimer && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`flex items-center px-4 py-2 rounded-lg border shadow-lg ${currentTaskTimerColorClass}`}
          >
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">Timer:</span>
              {currentTaskTimeLeftFormatted === "EXPIRED" ? (
                <AlertCircle className="h-4 w-4 mr-2" />
              ) : currentTaskTimeLeftFormatted &&
                currentTaskTimeLeftFormatted.startsWith("00:2") &&
                currentTaskTimeLeftFormatted <= "00:20" ? (
                <AlertCircle className="h-4 w-4 mr-2" />
              ) : (
                <Timer className="h-4 w-4 mr-2" />
              )}
              <span className="text-sm font-bold">
                {currentTaskTimeLeftFormatted || "--:--"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className="border-b border-gray-200 px-3 py-1 flex items-center justify-between bg-white sticky top-0 z-10"
        style={{ height: 40 }}
      >
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-sm font-semibold truncate">
              {isTraining ? "Training Tasks" : "Tasks"}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0 ml-3">
          <div className="text-xs text-gray-500 leading-tight">
            {completedTasksCount} of {totalTasksCount} completed
          </div>
          {tasksForDots.map((task, idx) => (
            <div
              key={task.id}
              onClick={() => {
                if (onDotClick && (isDomainExpert || !task.completed)) {
                  onDotClick(idx);
                }
              }}
              className={`w-2.5 h-2.5 rounded-full ${
                (isDomainExpert || !task.completed) && onDotClick
                  ? "cursor-pointer"
                  : "cursor-default"
              } ${
                idx === currentTaskIndex
                  ? "bg-blue-600"
                  : task.completed
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
              title={`Question ${idx + 1}${
                task.completed ? " (Completed)" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
