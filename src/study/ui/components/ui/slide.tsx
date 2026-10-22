import React from "react";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

interface SlideProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  currentSlide: number;
  totalSlides: number;
  onNext: () => void;
  onPrevious: () => void;
  nextButtonText?: string;
  nextButtonDisabled?: boolean;
  showNavigation?: boolean;
}

export function Slide({
  title,
  subtitle,
  children,
  currentSlide,
  totalSlides,
  onNext,
  onPrevious,
  nextButtonText = "Next",
  nextButtonDisabled = false,
  showNavigation = true,
}: SlideProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/5 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 max-w-4xl w-full mx-auto">
        {totalSlides > 1 && (
          <div className="text-sm font-medium text-blue-600 mb-3">
            Step {currentSlide + 1} of {totalSlides}
          </div>
        )}

        <div className="space-y-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-base text-gray-600 font-medium">{subtitle}</p>
          )}
        </div>

        <div className="mb-6">{children}</div>

        {showNavigation && (
          <div className="flex justify-between items-center mt-6">
            <div className="flex space-x-2">
              {Array.from({ length: totalSlides }, (_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentSlide ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center space-x-3">
              {currentSlide > 0 && (
                <button
                  disabled={nextButtonDisabled}
                  onClick={onPrevious}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
              )}
              <button
                onClick={onNext}
                disabled={nextButtonDisabled}
                className="flex items-center px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {nextButtonText}
                {nextButtonText !== "Submit to Get Completion Code" &&
                  nextButtonText !== "Continue to Next Section" && (
                    <ChevronRight className="w-4 h-4 ml-1" />
                  )}
                {(nextButtonText === "Submit to Get Completion Code" ||
                  nextButtonText === "Continue to Next Section") && (
                  <Send className="w-4 h-4 ml-2" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
