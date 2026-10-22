import { useState } from "react";
import { CheckCircle } from "lucide-react";
import type { CompletionDefinition } from "../types";

/** Original news completion-code page. Codes and participant wording are configured. */
export function CompletionPage({ title, config, onExport, mode, completionUrl, completionCode, storageLabel, participantId, studyId, preview = false }: {
  title: string;
  preview?: boolean;
  config?: CompletionDefinition;
  onExport?: () => void;
  mode: "dev" | "study";
  completionUrl?: string;
  completionCode?: string;
  storageLabel: string;
  participantId: string;
  studyId: string;
}) {
  const [copyStatus, setCopyStatus] = useState("");
  const copy = async () => {
    try { await navigator.clipboard.writeText(completionCode ?? ""); setCopyStatus("Completion code copied."); }
    catch { setCopyStatus("Please select and copy the code manually."); }
  };
  return <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
    <div className="w-full max-w-4xl mx-auto"><div className="bg-white rounded-xl shadow p-6"><div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto"><CheckCircle className="h-8 w-8 text-green-600" /></div>
      <div className="mb-6"><h2 className="text-2xl font-bold text-gray-900">{config?.title ?? "Thank You!"}</h2>
        <p className="text-base text-gray-500 mt-1">{config?.description ?? `Your participation in ${title} is now complete.`}</p></div>
      {completionCode && <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-6 mx-auto max-w-md">
        <h3 className="text-base font-medium text-gray-800 mb-2">{config?.codeLabel ?? "Your Completion Code"}</h3>
        <div className="flex items-center justify-center gap-2"><code className="bg-white px-4 py-2 rounded border border-gray-100 font-mono text-lg flex-grow text-center">{completionCode}</code>
          <button onClick={() => void copy()} className="px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 flex items-center justify-center transition-colors" aria-label="Copy completion code">Copy</button></div>
        <p role="status" className="text-sm text-gray-600 mt-2">{copyStatus}</p>
      </div>}
      <div className="space-y-3">
        <p className="text-sm text-gray-600">{mode === "dev" ? "DEMO-ONLY is a preview code. Do not submit it to a recruitment platform." : config?.instructions ?? "Return to your recruitment platform to complete the study."}</p>
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg"><p><strong>Study ID:</strong> {studyId}</p><p><strong>Participant ID:</strong> {participantId}</p></div>
        <p className="text-sm text-gray-600">{preview ? "Completion-page preview. Unfinished tasks have not been submitted." : `All responses and the completion event are saved in ${storageLabel}.`}</p>
        {mode === "study" && completionUrl && <a className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md" href={completionUrl}>{config?.returnLabel ?? "Return to recruitment platform"}</a>}
        {onExport && <button className="px-4 py-2 bg-blue-600 text-white rounded-md" onClick={onExport}>Download event JSON</button>}
        <p className="text-sm text-gray-400">{mode === "dev" ? "You can now close this test window or tab." : config?.footer ?? "You can now close this window or tab."}</p>
      </div>
    </div></div></div>
  </div>;
}
