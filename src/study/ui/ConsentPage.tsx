import { useState } from "react";
import type { Study } from "../types";

export default function ConsentPage({
  study,
  onNext,
  busy,
  mode,
}: {
  study: Study;
  onNext: () => void;
  busy: boolean;
  mode: "dev" | "study";
}) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Informed Consent
          </h1>
          <span className="inline-block bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm font-medium">
            Required Before Study
          </span>
        </div>

        <div className="prose prose-gray max-w-none mb-8 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">
            Study Information & Consent
          </h2>

          <div className="space-y-6">
            <section>
              <h3 className="font-semibold text-gray-800 mb-1">
                {study.title}
              </h3>
              <p className="text-gray-700">{study.description}</p>
            </section>
            <section className="whitespace-pre-line text-gray-700">
              {study.consent.text}
            </section>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <label className="flex items-start space-x-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 leading-5">
              {mode === "dev" ? "I have read and understood the information above. This is a test session and I will use synthetic responses." : "I have read and understood the information above and agree to participate in this study."}
            </span>
          </label>

          <div className="text-center">
            <button
              onClick={onNext}
              disabled={!agreed || busy}
              className={`px-8 py-3 rounded-md font-medium text-lg transition-colors ${
                agreed
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {busy ? "Saving..." : "Proceed to Study"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
