/**
 * Browser-local storage adapter for the runnable demo.
 * Replace this module with an approved, secured backend before collecting real data.
 */
export type StudyEvent = {
  eventId: string;
  studyId: string;
  participantId: string;
  eventType: string;
  occurredAt: string;
  data: Record<string, unknown>;
};

const EVENTS_KEY = "user-study-workflow:demo-events";
const PARTICIPANTS_KEY = "user-study-workflow:demo-participants";
const STUDY_ID = import.meta.env.VITE_STUDY_ID || "narrative-sketch-demo";

function readEvents(): StudyEvent[] {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]") as StudyEvent[];
  } catch {
    return [];
  }
}

function writeEvent(participantId: string, eventType: string, data: Record<string, unknown>) {
  const event: StudyEvent = {
    eventId: crypto.randomUUID(),
    studyId: STUDY_ID,
    participantId,
    eventType,
    occurredAt: new Date().toISOString(),
    data,
  };
  localStorage.setItem(EVENTS_KEY, JSON.stringify([...readEvents(), event]));
}

export async function checkUserExists(participantId: string): Promise<boolean> {
  try {
    const participants = JSON.parse(localStorage.getItem(PARTICIPANTS_KEY) || "[]") as string[];
    return participants.includes(participantId);
  } catch {
    return false;
  }
}

export async function createUser(participantId: string): Promise<void> {
  let participants: string[];
  try {
    participants = JSON.parse(localStorage.getItem(PARTICIPANTS_KEY) || "[]") as string[];
  } catch {
    participants = [];
  }
  if (!participants.includes(participantId)) {
    localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify([...participants, participantId]));
  }
  writeEvent(participantId, "participant-started", {});
}

export async function logUserSelectionData(
  participantId: string,
  mode: string,
  currentIndex: number,
  story: string,
  expectedAnswer: string,
  answer: string | null,
  reasoning: string,
  confidence: number | null,
  action: string | null,
) {
  writeEvent(participantId, "answer-action", {
    mode,
    taskIndex: currentIndex,
    itemId: story,
    expectedAnswer,
    answer,
    reasoning,
    confidence,
    action,
  });
}

export async function recordConsent(participantId: string) {
  writeEvent(participantId, "consent-acknowledged", { consentVersion: "demo-placeholder-1" });
}

export async function logRoutePathNavigation(participantId: string, route: string) {
  writeEvent(participantId, "route-visited", { route });
}

export async function logUserFeedback(
  participantId: string,
  feedback: string,
  activityFrequency: number | null,
) {
  writeEvent(participantId, "study-feedback", { feedback, activityFrequency });
}

export function downloadParticipantDemoData(participantId: string) {
  const participantEvents = readEvents().filter((event) => event.participantId === participantId);
  const blob = new Blob([JSON.stringify(participantEvents, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const safeId = participantId.replace(/[^a-zA-Z0-9_-]/g, "_");
  anchor.download = `demo-${safeId}-events.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function clearDemoData() {
  localStorage.removeItem(EVENTS_KEY);
  localStorage.removeItem(PARTICIPANTS_KEY);
  localStorage.removeItem("userStatus");
}
