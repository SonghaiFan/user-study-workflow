
import { useState, useEffect } from "react";
interface UsabilityTestStageProps { onNext: () => void; busy?: boolean }

export default function UsabilityTestStage({
  onNext,
  busy = false,
}: UsabilityTestStageProps) {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [screenSizeValid, setScreenSizeValid] = useState(false);
  const [testComplete, setTestComplete] = useState(false);

  // Cancel a pending pass when the window becomes too small or the component unmounts.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const checkScreenSize = () => {
      if (timer) clearTimeout(timer);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const valid = width >= 800 && height >= 600;
      setScreenSize({ width, height });
      setScreenSizeValid(valid);
      setTestComplete(false);
      if (valid) timer = setTimeout(() => setTestComplete(true), 1500);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => { if (timer) clearTimeout(timer); window.removeEventListener("resize", checkScreenSize); };
  }, []);

  if (testComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Device Compatibility Check Complete
          </h1>
          <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            System Check Passed
          </span>
          <p className="text-lg text-gray-700 mb-6">
            Your browser meets the minimum screen-size requirement. You can now proceed to
            the main study tasks.
          </p>
          <button
            disabled={busy || !screenSizeValid}
            onClick={() => { if (window.innerWidth >= 800 && window.innerHeight >= 600) onNext(); }}
            className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors font-medium text-lg"
          >
            Start Study
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Device Compatibility Check
          </h1>
          <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            System Requirements Check
          </span>
          <p className="text-lg text-gray-700 mb-6">
            Please verify that your device meets the minimum requirements for
            the study.
          </p>
        </div>

        <div className="space-y-6">
          {/* Screen Size Test */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Screen Size Test
              </h3>
              {screenSizeValid ? (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current size:</span>
                <span className="font-mono text-gray-900">
                  {screenSize.width} × {screenSize.height} pixels
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Required minimum:</span>
                <span className="font-mono text-gray-900">
                  800 × 600 pixels
                </span>
              </div>
            </div>

            {!screenSizeValid && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  <strong>Action needed:</strong> Please resize your browser
                  window or use a larger screen to continue.
                </p>
              </div>
            )}

            {screenSizeValid && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Screen size requirement met! Completing test...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
