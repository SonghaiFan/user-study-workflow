import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { cn } from "../../../lib/utils";

interface SequnceRankProps {
  options: { id: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function SequnceRank({
  options,
  value,
  onChange,
  disabled = false,
}: SequnceRankProps) {
  const events = (value.length ? value : options.map((o) => o.id)).map((id) => ({ id, text: options.find((o) => o.id === id)?.label ?? id }));
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);
    if (!result.destination) return;

    const newEvents = Array.from(events);
    const [reorderedEvent] = newEvents.splice(result.source.index, 1);
    newEvents.splice(result.destination.index, 0, reorderedEvent);

    onChange(newEvents.map((event) => event.id));
  };

  return (
    <div className="space-y-2">
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="sequence">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={cn(
                "space-y-1 p-2 rounded-lg border-2 border-dashed transition-colors",
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200"
              )}
            >
              {events.map((event, index) => (
                <Draggable
                  key={event.id}
                  draggableId={`event-${event.id}`}
                  index={index}
                  isDragDisabled={disabled}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn(
                        "p-2 rounded-md bg-white shadow-sm border transition-all",
                        snapshot.isDragging
                          ? "shadow-md border-blue-500 ring-2 ring-blue-500"
                          : "border-gray-200 hover:border-gray-300",
                        disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">
                          {index + 1}
                        </div>
                        <span className="text-sm flex-1">{event.text}</span>
                        {!disabled && (
                          <div className="text-gray-400 hover:text-gray-600">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="text-xs text-gray-500">
        Drag and drop items to reorder them
      </div>
    </div>
  );
}
