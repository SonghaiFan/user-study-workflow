import { getApps, initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { doc, getDocFromServer, getFirestore, runTransaction } from "firebase/firestore";
import type { RuntimeConfig } from "./runtime";
import type { Session, StudyStore } from "./types";

// Share startup across React StrictMode effects and reconnecting the same test store.
const connections = new Map<string, Promise<StudyStore>>();
export async function createCloudStore(config: RuntimeConfig): Promise<StudyStore> {
  if (!config.firebase) throw new Error("Firebase configuration is missing.");
  const key = `${config.mode}:${config.firebase.projectId}`;
  let connection = connections.get(key);
  if (!connection) {
    connection = openCloudStore(config).catch((error) => { connections.delete(key); throw error; });
    connections.set(key, connection);
  }
  return connection;
}

/** One server transaction commits progress and events together; no local fallback. */
async function openCloudStore(config: RuntimeConfig): Promise<StudyStore> {
  if (!config.firebase) throw new Error("Firebase configuration is missing.");
  const name = `study-template-${config.mode}-${config.firebase.projectId}`;
  const app = getApps().find((candidate) => candidate.name === name) ?? initializeApp(config.firebase, name);
  const auth = getAuth(app);
  await auth.authStateReady();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
  const db = getFirestore(app);
  const collection = config.mode === "study" ? "studySessions" : "testSessions";
  const reference = async (key: string) => {
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
    const id = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
    return doc(db, collection, user.uid, "sessions", id);
  };
  const decode = (data: Record<string, unknown>): Session => {
    if (data.ownerUid !== user.uid || data.runMode !== config.mode || typeof data.payload !== "string")
      throw new Error("Stored session belongs to a different owner or mode.");
    const session = JSON.parse(data.payload) as Session;
    if (session.schemaVersion !== 2 || session.runMode !== config.mode || session.revision !== data.revision || !Array.isArray(session.events))
      throw new Error("Invalid cloud session snapshot.");
    return session;
  };
  return {
    mode: "cloud",
    async load(key) {
      const snapshot = await getDocFromServer(await reference(key));
      return snapshot.exists() ? decode(snapshot.data()) : null;
    },
    async save(key, next, expectedRevision) {
      if (next.runMode !== config.mode) throw new Error("Refusing cross-mode data write.");
      const payload = JSON.stringify(next);
      // Firestore documents are limited to 1 MiB; leave room for envelope fields.
      if (new TextEncoder().encode(payload).length > 900_000)
        throw new Error("Session exceeded snapshot capacity. Contact the study administrator.");
      const ref = await reference(key);
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(ref);
        const before = snapshot.exists() ? decode(snapshot.data()) : null;
        if ((before?.revision ?? null) !== expectedRevision)
          throw new Error("Progress changed in another tab. Reload to resume.");
        transaction.set(ref, { ownerUid: user.uid, runMode: config.mode, revision: next.revision, studyId: next.studyId, studyVersion: next.studyVersion, sessionId: next.id, payload });
      });
    },
  };
}
