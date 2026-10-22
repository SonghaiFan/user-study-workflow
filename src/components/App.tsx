import { Component, useEffect, useState, type ReactNode } from "react";
import { StudyRunner } from "../study/StudyRunner";
import { LocalStudyStore } from "../study/store";
import { assertStudy } from "../study/engine";
import { readRuntime, readRecruitment } from "../study/runtime";
import type { StudyStore } from "../study/types";
import { plugin } from "../studies/demo";
import "../study/study.css";

class StudyBoundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: "" };
  static getDerivedStateFromError(error: Error) { return { error: error.message }; }
  render() {
    return this.state.error ? <main className="study-shell"><h1>Unable to open study</h1><p role="alert">{this.state.error}</p></main> : this.props.children;
  }
}
function StudyApp() {
  const [runtime] = useState(() => readRuntime(import.meta.env));
  const [persistent, setPersistent] = useState(() => runtime.mode === "study" || sessionStorage.getItem("study-template:dev-persist") !== "off");
  const [runId, setRunId] = useState(() => {
    if (runtime.mode === "study") return "participant";
    const saved = sessionStorage.getItem("study-template:dev-run");
    const id = saved ?? crypto.randomUUID();
    sessionStorage.setItem("study-template:dev-run", id);
    return id;
  });
  const [store, setStore] = useState<StudyStore | null>(null);
  const [error, setError] = useState("");
  const [definition] = useState(() => {
    const study = runtime.mode === "study" ? { ...plugin.study, consent: { version: runtime.consentVersion ?? "", text: runtime.consentText ?? "" } } : plugin.study;
    assertStudy(study);
    return { ...plugin, study };
  });
  const recruitment = readRecruitment(runtime.mode, window.location.search, runId);
  useEffect(() => {
    let cancelled = false;
    setStore(null);
    setError("");
    const connect = async () => {
      if (runtime.mode === "dev" && !persistent) {
        const memory = new Map<string, string>();
        return new LocalStudyStore({ getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => { memory.set(key, value); } }, "dev-memory");
      }
      if (runtime.storage === "local") return new LocalStudyStore(window.localStorage, "dev");
      const { createCloudStore } = await import("../study/cloudStore");
      return createCloudStore(runtime);
    };
    void connect().then((next) => { if (!cancelled) setStore(next); }).catch(() => { if (!cancelled) setError("Unable to connect to study storage. Check configuration and network, then reload. No data was saved locally."); });
    return () => { cancelled = true; };
  }, [runtime, persistent]);
  const reset = () => {
    if (runtime.mode !== "dev") return;
    const id = crypto.randomUUID();
    sessionStorage.setItem("study-template:dev-run", id);
    setRunId(id);
  };
  if (!store) return <main className="study-shell"><p role={error ? "alert" : "status"}>{error || "Connecting to study storage…"}</p></main>;
  return <StudyRunner key={`${runId}:${persistent}`} plugin={definition} store={store} recruitment={recruitment} runtime={runtime} onExit={() => window.location.reload()} debug={{ persistent, onReset: reset, onTogglePersistence: () => { setPersistent((value) => { sessionStorage.setItem("study-template:dev-persist", value ? "off" : "on"); return !value; }); reset(); } }} />;
}
export default function App() { return <StudyBoundary><StudyApp /></StudyBoundary>; }
