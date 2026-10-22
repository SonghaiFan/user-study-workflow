import { createSession, stepsFor } from "../engine";
import type { Recruitment, Session, Study } from "../types";
import type { RunMode } from "../runtime";

export function debugJump(mode: RunMode, study: Study, session: Session | null, recruitment: Recruitment, cursor: number): Session {
  if (mode !== "dev") throw new Error("Debug navigation is disabled in Study mode.");
  const before = session ?? createSession(study, recruitment);
  if (!Number.isInteger(cursor) || cursor < 0 || cursor >= stepsFor(study, before).length)
    throw new Error("Invalid debug destination.");
  const next = structuredClone(before);
  next.cursor = cursor;
  next.completed = false;
  next.revision += 1;
  next.events.push({ schemaVersion: 2, eventId: crypto.randomUUID(), studyId: study.id, studyVersion: study.version, sessionId: next.id, participantId: recruitment.participantId, eventType: "debug-jump", occurredAt: new Date().toISOString(), data: { from: session?.cursor ?? "consent", to: cursor, synthetic: true } });
  return next;
}
