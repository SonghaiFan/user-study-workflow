import { useState } from "react";
import type { Answer, FeedbackDefinition } from "../types";
import { feedbackErrors } from "../engine";
import { ResponseInput } from "../ResponseInput";
import { Slide } from "./components/ui/slide";
import { RatingScale } from "./components/ui/rating-scale";

/** Original news dimension/study feedback slides, rating cards and comment card;
 * only the experiment-specific questions have moved into configuration. */
export function FeedbackForm({ definition, busy, onSubmit }: {
  definition: FeedbackDefinition;
  busy: boolean;
  onSubmit: (data: Record<string, unknown>) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [startedAt] = useState(Date.now);
  const page = definition.pages[index];
  const last = index === definition.pages.length - 1;
  const next = () => {
    const validation = feedbackErrors(last ? definition : { ...definition, pages: [page] }, answers);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    if (!last) setIndex(index + 1);
    else onSubmit({ answers, feedbackDuration: Date.now() - startedAt });
  };
  return <Slide title={page.title} subtitle={page.subtitle} currentSlide={index} totalSlides={definition.pages.length}
    onNext={next} onPrevious={() => setIndex(index - 1)} nextButtonText={busy ? "Submitting..." : last ? definition.submitLabel : "Next"} nextButtonDisabled={busy}>
    <fieldset disabled={busy} className="space-y-4">
      {page.fields.map((field) => {
        const change = (answer: Answer) => setAnswers((before) => ({ ...before, [field.id]: answer }));
        const value = answers[field.id] ?? null;
        if (field.response.type === "rating") return <RatingScale key={field.id} label={field.label} description={field.description}
          leftLabel={field.leftLabel ?? ""} rightLabel={field.rightLabel ?? ""} error={errors[field.id]} disabled={busy}
          value={typeof value === "number" ? value : null} onChange={change}
          values={Array.from({length: field.response.max - field.response.min + 1}, (_, i) => (field.response as {min:number}).min + i)} />;
        return <div key={field.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <label htmlFor={`feedback-${field.id}`} className="block text-xl font-bold text-gray-900 mb-4">{field.label}{field.required !== false && <span className="text-red-500"> *</span>}</label>
          {field.description && <p className="text-base text-gray-700 mb-4 font-medium">{field.description}</p>}
          {field.prompts && <ul className="text-base text-gray-700 mb-6 ml-4 space-y-2 list-disc">{field.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul>}
          {field.response.type === "text" ? <textarea id={`feedback-${field.id}`} value={typeof value === "string" ? value : ""}
            onChange={(e) => change(e.target.value)} placeholder={field.placeholder} maxLength={field.response.maxLength ?? 10000} aria-invalid={!!errors[field.id]}
            className={`w-full h-40 p-4 text-base text-gray-900 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder:text-gray-500 ${errors[field.id] ? "border-red-300" : "border-gray-300"}`} />
            : <ResponseInput response={field.response} answer={value} onAnswer={change} disabled={busy} />}
          {errors[field.id] && <p role="alert" className="text-sm text-red-600 mt-2 font-medium">{errors[field.id]}</p>}
        </div>;
      })}
      {last && definition.footer && <div className="text-center text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">{definition.footer}</div>}
    </fieldset>
  </Slide>;
}
