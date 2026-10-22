import type { Session, StudyStore } from "./types";

export class LocalStudyStore implements StudyStore {
  readonly mode = "demo" as const;
  constructor(private storage: Pick<Storage, "getItem" | "setItem">, private namespace = "dev") {}
  async load(key: string): Promise<Session | null> {
    const raw = this.storage.getItem(`${this.namespace}:${key}`);
    if (raw === null) return null;
    const session = JSON.parse(raw) as Session;
    if (
      session.schemaVersion !== 2 ||
      !session.id ||
      !Number.isInteger(session.revision) ||
      !Number.isInteger(session.cursor) ||
      !Array.isArray(session.events) ||
      !session.orders ||
      !session.responses ||
      !session.presentedAt ||
      !session.recruitment
    )
      throw new Error(
        "Saved session is damaged or uses an unsupported schema. Export or clear it manually before restarting.",
      );
    return session;
  }
  async save(key: string, next: Session, expectedRevision: number | null) {
    // One JSON write commits progress and events together; never swallow quota errors.
    // Cross-tab read/modify/write is not transactional: use one tab in demo mode.
    const current = await this.load(key);
    if ((current?.revision ?? null) !== expectedRevision)
      throw new Error(
        "Progress changed in another tab. Reload to resume the latest saved session.",
      );
    this.storage.setItem(`${this.namespace}:${key}`, JSON.stringify(next));
  }
}
export function sessionKey(studyId: string, version: string, identity: string) {
  return `study-starter:v2:${JSON.stringify([studyId, version, identity])}`;
}
export function downloadSession(session: Session) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(session.events, null, 2)], {
      type: "application/json",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `study-${session.id}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
