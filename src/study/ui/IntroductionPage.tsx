import { useState } from "react";
import { ArrowRight, PlayCircle } from "lucide-react";
import type { IntroductionSlide } from "../types";
import { Button } from "./components/ui/button";

/** News introduction card, step indicator and navigation, with configurable content. */
export function IntroductionPage({ slides, onComplete, busy, completionLabel }: {
  slides: IntroductionSlide[];
  onComplete: () => void;
  busy: boolean;
  completionLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/5 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-5xl w-full mx-auto">
        <div className="text-sm font-medium text-blue-600 mb-4">Step {index + 1} of {slides.length}</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">{slide.title}</h2>
        {slide.image && <img src={slide.image.src} alt={slide.image.alt} className="w-full h-80 object-contain mb-8 rounded-lg border border-gray-100" />}
        <p className="text-gray-600 text-lg whitespace-pre-line mb-8">{slide.content}</p>
        {slide.notice && <div className={`rounded-lg p-6 text-left border mb-8 ${slide.notice.tone === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
          <h3 className="text-lg font-semibold mb-3">{slide.notice.heading}</h3>
          <p className="mb-4 whitespace-pre-line">{slide.notice.content}</p>
          {slide.notice.bullets && <ul className="list-disc pl-5 space-y-1">{slide.notice.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
        </div>}
        {slide.footer && <p className="text-gray-600 font-medium text-center">{slide.footer}</p>}
        {slide.video && (slide.video.src ? (slide.video.kind === "embed" ? <iframe src={slide.video.src} title={slide.video.label} allowFullScreen className="w-full max-w-lg mx-auto aspect-video rounded-lg" /> : (
          <video key={slide.video.src} controls preload="metadata" aria-label={slide.video.label} className="w-full max-w-lg mx-auto aspect-video bg-gray-900 rounded-lg">
            <source src={slide.video.src} />
            Your browser does not support this video.
          </video>
        )) : (
          <div role="img" aria-label={slide.video.label} className="w-full max-w-lg mx-auto aspect-video rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-3 text-gray-500">
            <PlayCircle className="h-12 w-12" aria-hidden="true" />
            <p className="font-medium">{slide.video.label}</p>
            <p className="text-sm">No video added yet</p>
          </div>
        ))}
        <div className="flex justify-between items-center mt-10 gap-4">
          <div className="flex space-x-2" aria-hidden="true">{slides.map((_, dot) => <div key={dot} className={`w-3 h-3 rounded-full ${dot === index ? "bg-blue-500" : "bg-gray-200"}`} />)}</div>
          <div className="flex items-center gap-3">
            {index > 0 && <button disabled={busy} onClick={() => setIndex(index - 1)} className="text-sm text-gray-600">Back</button>}
            <Button disabled={busy} onClick={() => index < slides.length - 1 ? setIndex(index + 1) : onComplete()} variant="primary" size="lg">
              {index < slides.length - 1 ? "Next" : completionLabel}<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
