import * as RadioGroup from "@radix-ui/react-radio-group";
import { cn } from "../../../lib/utils";

interface SingleSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  optionLabels?: Record<string, string>;
  appendNoneOfAbove?: boolean;
}

export function SingleSelect({
  options,
  value,
  onChange,
  disabled = false,
  optionLabels = {},
  appendNoneOfAbove = false,
}: SingleSelectProps) {
  // Add "None of above" option if not already present
  const hasNoneOfAbove = options.some(
    (option) =>
      option.toLowerCase().includes("none of") ||
      option.toLowerCase().includes("none of the above")
  );

  const allOptions = hasNoneOfAbove || !appendNoneOfAbove ? options : [...options, "None of above"];

  return (
    <RadioGroup.Root
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      className="space-y-1.5"
    >
      {allOptions.map((option) => {
        const isSelected = value === option;
        const isNoneOfAbove = option === "None of above";
        return (
          <div
            key={option}
            className={cn(
              "group relative flex items-center rounded-md border px-3 py-2 transition-all",
              isSelected
                ? isNoneOfAbove
                  ? "bg-amber-50/50 border-amber-100"
                  : "bg-blue-50/50 border-blue-100"
                : "bg-white border-transparent hover:bg-gray-50/50",
              "ring-1",
              isNoneOfAbove
                ? "ring-amber-200 hover:ring-amber-300"
                : "ring-gray-200 hover:ring-gray-300",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <RadioGroup.Item
              value={option}
              id={option}
              className={cn(
                "h-4 w-4 shrink-0 rounded-full border transition-all",
                isSelected
                  ? isNoneOfAbove
                    ? "border-amber-500 bg-white"
                    : "border-blue-500 bg-white"
                  : "border-gray-300 bg-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
                isNoneOfAbove
                  ? "focus-visible:ring-amber-500/30"
                  : "focus-visible:ring-blue-500/30",
                disabled && "cursor-not-allowed"
              )}
            >
              <RadioGroup.Indicator className="flex items-center justify-center">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full transition-transform",
                    isNoneOfAbove ? "bg-amber-500" : "bg-blue-500",
                    isSelected ? "scale-100" : "scale-0"
                  )}
                />
              </RadioGroup.Indicator>
            </RadioGroup.Item>
            <label
              htmlFor={option}
              className={cn(
                "ml-2.5 flex-1 text-sm transition-colors select-none",
                isSelected
                  ? isNoneOfAbove
                    ? "text-amber-900"
                    : "text-blue-900"
                  : "text-gray-700",
                disabled ? "cursor-not-allowed" : "cursor-pointer"
              )}
            >
              {optionLabels[option] ?? option}
            </label>
          </div>
        );
      })}
    </RadioGroup.Root>
  );
}
