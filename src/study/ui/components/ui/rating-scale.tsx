/* eslint-disable react-refresh/only-export-components -- Original shared rating component exports its rating definitions. */
import React from "react";

const RATING_SCALE = [1, 2, 3, 4, 5] as const;

// Rating descriptions for each scale type
const RATING_DESCRIPTIONS = {
  frequency: {
    1: "Rarely - Almost never looked at visualizations",
    2: "Occasionally - Glanced at them a few times",
    3: "Sometimes - Used them for some questions",
    4: "Often - Frequently referred to visualizations",
    5: "Always - Constantly used visualizations",
  },
  helpfulness: {
    1: "Not helpful - Confusing or misleading",
    2: "Slightly helpful - Minimal assistance",
    3: "Moderately helpful - Useful for some aspects",
    4: "Very helpful - Significantly aided understanding",
    5: "Extremely helpful - Essential for tasks",
  },
  preference: {
    1: "Strongly prefer text-only - Visualizations were distracting",
    2: "Prefer text-only - Text was easier to work with",
    3: "No preference - Both interfaces worked equally well",
    4: "Prefer with visualizations - Provided useful context",
    5: "Strongly prefer with visualizations - Much easier",
  },
  experience: {
    1: "Very poor - Frustrating and difficult",
    2: "Poor - Challenging with difficulties",
    3: "Fair - Manageable but required effort",
    4: "Good - Comfortable and straightforward",
    5: "Excellent - Easy and intuitive",
  },
} as const;

type RatingValue = number | null;

interface RatingScaleProps {
  value: RatingValue;
  onChange: (value: number) => void;
  error?: string;
  label: React.ReactNode;
  leftLabel: string;
  rightLabel: string;
  disabled?: boolean;
  values?: number[];
  ratingType?: keyof typeof RATING_DESCRIPTIONS;
  description?: string;
}

export function RatingScale({
  value,
  onChange,
  error,
  label,
  leftLabel,
  rightLabel,
  ratingType,
  description,
  disabled = false,
  values = [...RATING_SCALE],
}: RatingScaleProps) {
  const getDescription = () => {
    if (value == null || !ratingType) return null;
    return RATING_DESCRIPTIONS[ratingType][
      value as keyof (typeof RATING_DESCRIPTIONS)[typeof ratingType]
    ];
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-base font-bold text-gray-900 block">
            {label}
          </label>
          {description && (
            <p className="text-sm text-gray-700 font-medium">{description}</p>
          )}
        </div>

        <div className="space-y-2">
          {/* Rating scale in a row with labels at each end */}
          <div className="flex items-center w-full">
            <span className="text-sm font-medium text-gray-600 mr-3 flex-shrink-0">
              {leftLabel}
            </span>
            <div className="flex items-center justify-center flex-1 space-x-2">
              {values.map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={disabled}
                  aria-pressed={value === num}
                  className={`w-10 h-10 rounded-full border-2 font-semibold transition-all ${
                    value === num
                      ? "bg-blue-600 border-blue-700 text-white shadow-lg scale-105"
                      : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:scale-105"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
                  onClick={() => onChange(num)}
                  aria-label={`Rating ${num}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-600 ml-3 flex-shrink-0">
              {rightLabel}
            </span>
          </div>

          {getDescription() && (
            <div className="text-xs text-blue-700 font-medium text-center italic">
              {getDescription()}
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="text-xs text-red-600 text-center mt-2 font-medium bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}

export type { RatingValue };
export { RATING_DESCRIPTIONS };
