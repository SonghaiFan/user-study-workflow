import type { Recruitment } from "./types";

export type RunMode = "dev" | "study";
export interface RuntimeConfig {
  mode: RunMode;
  storage: "local" | "cloud";
  firebase?: { apiKey: string; authDomain: string; projectId: string; appId: string };
  completionUrl?: string;
  completionCode?: string;
  consentText?: string;
  consentVersion?: string;
}

/** Build configuration only. Query parameters never select mode or storage. */
export function readRuntime(env: Record<string, string | boolean | undefined>): RuntimeConfig {
  const mode = env.VITE_RUN_MODE ?? (env.DEV ? "dev" : "study");
  if (mode !== "dev" && mode !== "study") throw new Error("Invalid VITE_RUN_MODE.");
  const storage = mode === "study" ? "cloud" : (env.VITE_DEV_STORAGE ?? "local");
  if (storage !== "local" && storage !== "cloud") throw new Error("Invalid VITE_DEV_STORAGE.");
  const config: RuntimeConfig = { mode, storage };
  if (mode === "study") {
    if (!env.VITE_STUDY_CONSENT_TEXT || !env.VITE_STUDY_CONSENT_VERSION)
      throw new Error("Study deployment needs its own consent text and version.");
    config.consentText = String(env.VITE_STUDY_CONSENT_TEXT);
    config.consentVersion = String(env.VITE_STUDY_CONSENT_VERSION);
    if (!env.VITE_COMPLETION_URL) throw new Error("Study deployment needs VITE_COMPLETION_URL.");
    const url = new URL(String(env.VITE_COMPLETION_URL));
    if (url.protocol !== "https:") throw new Error("Completion URL must use HTTPS.");
    config.completionUrl = url.href;
    config.completionCode = String(env.VITE_COMPLETION_CODE || url.searchParams.get("cc") || "");
  }
  if (storage === "cloud") {
    const prefix = mode === "dev" ? "VITE_DEV_FIREBASE_" : "VITE_STUDY_FIREBASE_";
    const get = (key: string) => {
      const value = env[prefix + key];
      if (!value) throw new Error(`Missing ${prefix}${key}. Cloud storage cannot fall back to local storage.`);
      return String(value);
    };
    config.firebase = { apiKey: get("API_KEY"), authDomain: get("AUTH_DOMAIN"), projectId: get("PROJECT_ID"), appId: get("APP_ID") };
    if (mode === "dev" && config.firebase.projectId === env.VITE_STUDY_FIREBASE_PROJECT_ID)
      throw new Error("Dev and Study must use different Firebase projects.");
  }
  return config;
}

export function readRecruitment(mode: RunMode, search: string, devRunId: string): Recruitment {
  if (mode === "dev") return { platform: "demo", participantId: `test-${devRunId}` };
  const params = new URLSearchParams(search);
  const participantId = params.get("PROLIFIC_PID");
  const studyId = params.get("STUDY_ID");
  const sessionId = params.get("SESSION_ID");
  if (!participantId?.trim() || !studyId?.trim() || !sessionId?.trim())
    throw new Error("Study launch requires PROLIFIC_PID, STUDY_ID and SESSION_ID.");
  return { platform: "prolific", participantId, studyId, sessionId };
}
