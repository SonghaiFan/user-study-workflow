import { useState } from "react";

/** Extracted from news_text_visualisation/src/components/debug/DebugPanel.tsx.
 * Retains its red collapsed bar and floating flat menu; framework props replace
 * the news auth context, scenario stages and Firebase singleton. */
export function DebugPanel({ phase, steps, cursor, sessionId, storage, busy, persistent, onJump, onReset, onTogglePersistence, onExport, onCheck }: {
  phase: string; steps: string[]; cursor?: number; sessionId?: string;
  storage: string; busy: boolean; persistent: boolean;
  onJump: (index: number) => void; onReset: () => void;
  onTogglePersistence: () => void; onExport?: () => void; onCheck: () => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("untested");
  const check = async () => {
    setStatus("testing…");
    try { await onCheck(); setStatus("OK"); } catch { setStatus("Failed"); }
  };
  return <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
    {!expanded ? <button onClick={() => setExpanded(true)} className="bg-red-500/90 backdrop-blur text-white px-4 py-1 rounded-full cursor-pointer hover:bg-red-600/90 transition-colors shadow-lg border border-red-600">
      <span className="flex items-center gap-2 text-xs font-medium"><span className="w-2 h-2 bg-white rounded-full animate-pulse" /> DEBUG • DEV • {phase.toUpperCase()} ▼</span>
    </button> : <div className="bg-white/95 backdrop-blur rounded-lg shadow-xl border border-gray-200 p-3 w-96 max-w-[95vw]">
      <div className="flex items-center justify-between mb-3"><span className="text-xs font-bold text-red-600">DEBUG • TEST DATA ONLY</span><button aria-label="Close debug panel" onClick={() => setExpanded(false)}>×</button></div>
      <p className="text-xs text-gray-500 mb-3">{phase} • {storage} • {sessionId?.slice(-8) ?? "No session"}</p>
      <fieldset disabled={busy} className="flex flex-wrap items-center gap-2 text-xs">
        <button className="px-2 py-1 rounded bg-gray-100" onClick={onReset}>New test / Consent</button>
        <label className="w-full">Jump to step
          <select aria-label="Jump to step" className="block w-full border rounded mt-1 p-1" value={cursor ?? ""} onChange={(e) => onJump(Number(e.target.value))}>
            <option value="" disabled>Choose a step</option>{steps.map((label, index) => <option key={index} value={index}>{index + 1}. {label}</option>)}
          </select>
        </label>
        <button className="px-2 py-1 rounded bg-purple-100 text-purple-700" onClick={() => void check()}>Storage: {status}</button>
        <button className={`px-2 py-1 rounded ${persistent ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`} onClick={onTogglePersistence}>Save test data: {persistent ? "ON" : "OFF"}</button>
        {onExport && <button className="px-2 py-1 rounded bg-blue-100 text-blue-700" onClick={onExport}>Export test JSON</button>}
      </fieldset>
      <p className="mt-2 text-xs text-gray-500">New test and storage changes start a separate test session. Existing test data is preserved.</p>
    </div>}
  </div>;
}
