import { FeedbackForm } from "./ui/FeedbackForm";
import { IntroductionPage } from "./ui/IntroductionPage";
import { DebugPanel } from "./debug/DebugPanel";
import { debugJump } from "./debug/navigation";
import type { RuntimeConfig } from "./runtime";
import { ResponseInput } from "./ResponseInput";
import ConsentPage from "./ui/ConsentPage";
import { InfoPage } from "./ui/InfoPage";
import { CompletionPage } from "./ui/CompletionPage";
import UsabilityTestStage from "./ui/components/stages/UsabilityTestStage";
import { TaskHeader } from "./ui/components/task/task-header";
import { TaskFooter } from "./ui/components/task/task-footer";
import { TaskQuestionArea } from "./ui/components/task/task-question-area";
import { ConfirmSubmitModal } from "./ui/components/task/modals/confirm-submit-modal";
import { IncorrectAnswerModal } from "./ui/components/task/modals/incorrect-answer-modal";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StudyPlugin } from "./plugin";
import type {
  Answer,
  Recruitment,
  Session,
  StudyStore,
  Submission,
} from "./types";
import {
  advance,
  createSession,
  currentStep,
  finalize,
  presentQuiz,
  quizKey,
  recordInteraction,
  stepsFor,
  submitQuiz,
} from "./engine";
import { downloadSession, sessionKey } from "./store";

function requireSession(session: Session | null): Session {
  if (!session) throw new Error("No active study session.");
  return session;
}

export function StudyRunner({
  plugin,
  store,
  recruitment,
  onExit,
  runtime,
  debug,
}: {
  plugin: StudyPlugin;
  store: StudyStore;
  recruitment: Recruitment;
  onExit: () => void;
  runtime: RuntimeConfig;
  debug: { persistent: boolean; onReset: () => void; onTogglePersistence: () => void };
}) {
  const { study, Task, Introduction, Feedback } = plugin;
  const key = `${runtime.mode}:${sessionKey(study.id, `${study.version}:${study.consent.version}`, JSON.stringify(recruitment))}`;
  const [session, setSession] = useState<Session | null>(null);
  const live = useRef<Session | null>(null);
  const queue = useRef(Promise.resolve());
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [incorrectOpen, setIncorrectOpen] = useState(false);
  const [answer, setAnswer] = useState<Answer>(null);
  const [reasoning, setReasoning] = useState("");
  const [confidence, setConfidence] = useState<number | undefined>();
  const [feedback, setFeedback] = useState("");
  const [now, setNow] = useState(Date.now());
  const [readyKey, setReadyKey] = useState("");
  const [readyAttempt, setReadyAttempt] = useState(0);
  const step = session ? currentStep(study, session) : null;
  const activeKey =
    step?.kind === "quiz" ? quizKey(step.block.id, step.quiz.id) : "";
  const ready = readyKey === activeKey;
  const savedResponse = session?.responses[activeKey];
  const startedAt = session?.presentedAt[activeKey];
  const timeLimit =
    step?.kind === "quiz" ? step.quiz.timeLimitSeconds : undefined;
  const expired =
    startedAt !== undefined &&
    timeLimit !== undefined &&
    now >= startedAt + timeLimit * 1000;

  useEffect(() => {
    let cancelled = false;
    store
      .load(key)
      .then((saved) => {
        if (cancelled) return;
        if (saved) currentStep(study, saved);
        live.current = saved;
        setSession(saved);
        setLoaded(true);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e.message ?? e));
      });
    return () => {
      cancelled = true;
    };
  }, [key, store, study]);

  const commit = useCallback(
    (change: (current: Session | null) => Session) => {
      // Serialize framework and plugin writes. A failed save never advances visible state.
      const operation = queue.current.then(async () => {
        setBusy(true);
        setError("");
        try {
          const before = live.current;
          const changed = change(before);
          const next = changed === before ? changed : {
            ...changed,
            runMode: runtime.mode,
            events: changed.events.map((event) => ({ ...event, runMode: runtime.mode })),
          };
          if (before !== next)
            await store.save(key, next, before?.revision ?? null);
          live.current = next;
          setSession(next);
        } catch (e) {
          setError(e instanceof Error ? e.message : String(e));
          throw e;
        } finally {
          setBusy(false);
        }
      });
      queue.current = operation.catch(() => undefined);
      return operation;
    },
    [key, store, runtime.mode],
  );
  const perform = (change: (current: Session | null) => Session) => {
    void commit(change).catch(() => undefined);
  };
  const onReady = useCallback(() => {
    setReadyKey(activeKey);
  }, [activeKey]);
  const onEvent = useCallback(
    (name: string, payload: Record<string, unknown>) =>
      commit((current) => {
        if (!current) throw new Error("No active session.");
        const active = currentStep(study, current);
        if (
          active.kind !== "quiz" ||
          quizKey(active.block.id, active.quiz.id) !== activeKey
        )
          return current;
        return recordInteraction(study, current, name, payload);
      }),
    [commit, study, activeKey],
  );

  useEffect(() => {
    setAnswer(null);
    setReasoning("");
    setConfidence(undefined);
    setFeedback("");
  }, [session?.cursor]);
  useEffect(() => {
    if (ready && activeKey && startedAt === undefined)
      void commit((current) => {
        const currentSession = requireSession(current);
        const active = currentStep(study, currentSession);
        if (
          active.kind !== "quiz" ||
          quizKey(active.block.id, active.quiz.id) !== activeKey
        )
          return currentSession;
        return presentQuiz(study, currentSession);
      }).catch(() => undefined);
  }, [ready, activeKey, startedAt, study, commit, readyAttempt]);
  useEffect(() => {
    if (startedAt === undefined || savedResponse) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [startedAt, savedResponse]);

  const submit = (outcome: Submission["outcome"]) => {
    const submittedCursor = session?.cursor;
    setConfirmOpen(false);
    void commit((current) =>
      current?.cursor !== submittedCursor
        ? requireSession(current)
        : submitQuiz(study, requireSession(current), {
            answer,
            outcome,
            reasoning,
            confidence,
          }),
    )
      .then(async () => {
        if (live.current?.cursor !== submittedCursor) return;
        const accepted = live.current?.responses[activeKey];
        if (accepted) {
          const cursor = submittedCursor;
          await commit((current) =>
            current?.cursor === cursor
              ? advance(study, requireSession(current))
              : requireSession(current),
          );
        } else {
          setIncorrectOpen(true);
        }
      })
      .catch(() => undefined);
  };

  const next = () => {
    const expectedCursor = session?.cursor;
    perform((current) =>
      requireSession(current).cursor === expectedCursor
        ? advance(study, requireSession(current), feedback)
        : requireSession(current),
    );
  };

  // The original flow moves from the last feedback directly to completion.
  // Persist the final event first; a failed attempt stays on the retry screen.
  useEffect(() => {
    if (loaded && step?.kind === "finish")
      void commit((current) => finalize(study, requireSession(current), Date.now(), runtime.mode)).catch(() => undefined);
  }, [loaded, step?.kind, study, commit, runtime.mode]);

  if (!loaded)
    return (
      <InfoPage
        title={error ? "Unable to load study" : "Loading study…"}
        onContinue={onExit}
        label="Back to studies"
      >
        <p role={error ? "alert" : "status"}>
          {error || "Restoring saved progress."}
        </p>
      </InfoPage>
    );
  const progress = session
    ? ((session.cursor + 1) / stepsFor(study, session).length) * 100
    : 0;
  const errors = error ? (
    <div
      role="alert"
      className="fixed bottom-4 left-4 max-w-lg rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800 z-50"
    >
      {error}
    </div>
  ) : null;
  const chrome = (
    <>
      {session && !session.completed && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {errors}
      {runtime.mode === "dev" && <DebugPanel
        phase={session?.completed ? "complete" : step?.kind ?? "consent"}
        steps={stepsFor(study, session ?? createSession(study, recruitment)).map((item) => item.kind === "quiz" ? `${item.block.title} / ${item.quiz.question}` : "block" in item ? `${item.block.title} / ${item.kind}` : item.kind)}
        cursor={session?.cursor} sessionId={session?.id}
        storage={!debug.persistent ? "Memory" : store.mode === "cloud" ? "Test Firebase" : "Local test storage"}
        busy={busy} persistent={debug.persistent}
        onJump={(cursor) => { setConfirmOpen(false); setIncorrectOpen(false); perform((current) => debugJump(runtime.mode, study, current, recruitment, cursor)); }}
        onReset={debug.onReset} onTogglePersistence={debug.onTogglePersistence}
        onExport={session ? () => downloadSession(session) : undefined}
        onCheck={async () => { await store.load(key); }}
      />}
    </>
  );
  if (!session)
    return (
      <>
        {chrome}
        <ConsentPage
          study={study}
          mode={runtime.mode}
          busy={busy}
          onNext={() => perform(() => createSession(study, recruitment))}
        />
      </>
    );
  if (session.completed)
    return (
      <>
        {chrome}
        <CompletionPage
          title={study.title}
          onExport={runtime.mode === "dev" ? () => downloadSession(session) : undefined}
          mode={runtime.mode}
          completionUrl={runtime.completionUrl}
          preview={session.events.some((event) => event.eventType === "debug-completion-preview")}
          completionCode={runtime.mode === "dev" ? "DEMO-ONLY" : runtime.completionCode}
          config={study.completion}
          participantId={recruitment.participantId}
          studyId={study.id}
          storageLabel={!debug.persistent ? "memory for this page only" : store.mode === "cloud" ? "the study server" : "this browser"}
        />
      </>
    );
  if (step?.kind === "screen-check")
    return (
      <>
        {chrome}
        <UsabilityTestStage onNext={next} busy={busy} />
      </>
    );
  if (step?.kind === "block-intro")
    return (
      <>
        {chrome}
        {Introduction ? (
          <fieldset disabled={busy}>
            <Introduction
              key={session.cursor}
              block={step.block}
              onContinue={next}
            />
          </fieldset>
        ) : step.block.introduction?.length ? (
          <IntroductionPage key={step.block.id} slides={step.block.introduction} onComplete={next} busy={busy} completionLabel={step.block.startLabel ?? (step.block.mode === "training" ? "Start Training" : "Start Tasks")} />
        ) : (
          <InfoPage
            title={step.block.title}
            onContinue={next}
            label="Begin block"
            busy={busy}
          >
            <p className="whitespace-pre-line">{step.block.instructions}</p>
          </InfoPage>
        )}
      </>
    );
  if (step?.kind === "finish")
    return (
      <>
        {chrome}
        <InfoPage
          title={error ? "Unable to complete study" : "Saving your completion…"}
          onContinue={() =>
            perform((current) => finalize(study, requireSession(current), Date.now(), runtime.mode))
          }
          label="Retry completion"
          busy={busy}
        >
          <p>
            Your responses are saved. Your completion page will appear after the final save succeeds.
          </p>
        </InfoPage>
      </>
    );
  if (step?.kind === "study-feedback" || step?.kind === "block-feedback") {
    const configured = step.kind === "block-feedback" ? step.block.feedback : study.feedback;
    const definition = configured && typeof configured === "object" ? configured : {
      submitLabel: "Submit feedback",
      pages: [{ title: "Study Feedback", fields: [{ id: "comments", label: "What worked well? What was difficult? (optional)", response: { type: "text" as const }, required: false }] }],
    };
    const submitFeedback = (data: Record<string, unknown>) => {
      const cursor = session.cursor;
      perform((current) => current?.cursor === cursor ? advance(study, requireSession(current), data) : requireSession(current));
    };
    return <>{chrome}{Feedback ? (
      <fieldset disabled={busy}><Feedback key={session.cursor} block={step.kind === "block-feedback" ? step.block : undefined} onSubmit={submitFeedback} /></fieldset>
    ) : <FeedbackForm key={session.cursor} definition={definition} busy={busy} onSubmit={submitFeedback} />}</>;
  }
  if (step?.kind !== "quiz") return null;
  const order = session.orders[step.block.id];
  const index = order.indexOf(step.quiz.id);
  const tasksForDots = order.map((id) => ({
    id,
    completed: !!session.responses[quizKey(step.block.id, id)],
  }));
  const seconds =
    startedAt !== undefined && timeLimit !== undefined
      ? Math.max(0, Math.ceil((startedAt + timeLimit * 1000 - now) / 1000))
      : null;
  const timer =
    seconds === null
      ? null
      : seconds === 0
        ? "EXPIRED"
        : `${Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  const question = {
    id: step.quiz.id,
    question: step.quiz.question,
    questionCaption: step.quiz.description,
    notice: step.quiz.notice,
  };
  const panel = (
    <div className="flex flex-col h-full bg-white">
      <TaskHeader
        isTraining={step.block.mode === "training"}
        showTimer={timeLimit !== undefined}
        completedTasksCount={tasksForDots.filter((t) => t.completed).length}
        totalTasksCount={order.length}
        currentTaskIndex={index}
        currentTaskTimeLeftFormatted={timer}
        currentTaskTimerColorClass={
          expired
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-gray-50 border-gray-200 text-gray-600"
        }
        isDomainExpert={false}
        tasksForDots={tasksForDots}
      />
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        <TaskQuestionArea
          currentTask={question}
          currentTaskIndex={index}
          isDomainExpert={false}
        />
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Your Answer
          </h3>
          <ResponseInput
            key={activeKey}
            response={step.quiz.response}
            answer={savedResponse?.answer ?? answer}
            onAnswer={setAnswer}
            disabled={busy || !!savedResponse || expired}
          />
        </div>
        {step.quiz.collectReasoning && (
          <label className="field p-3 text-sm">
            Reasoning
            <textarea
              value={savedResponse?.reasoning ?? reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              disabled={busy || !!savedResponse || expired}
            />
          </label>
        )}
        {step.quiz.collectConfidence && (
          <label className="field p-3 text-sm">
            Confidence (1–5)
            <select
              value={savedResponse?.confidence ?? confidence ?? ""}
              onChange={(e) =>
                setConfidence(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              disabled={busy || !!savedResponse || expired}
            >
              <option value="">Choose confidence</option>
              {[1, 2, 3, 4, 5].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        )}
        {expired && (
          <p className="text-xs text-red-700">
            Time expired. Submit to save your timed-out response.
          </p>
        )}
        {step.quiz.allowSkip && !savedResponse && (
          <button
            className="text-sm text-gray-500 underline"
            disabled={busy || startedAt === undefined}
            onClick={() => submit("skipped")}
          >
            Skip question
          </button>
        )}
        {ready && startedAt === undefined && error && (
          <button onClick={() => setReadyAttempt((v) => v + 1)}>
            Retry starting quiz
          </button>
        )}
        {savedResponse && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
            disabled={busy}
            onClick={next}
          >
            Continue
          </button>
        )}
      </div>
      <TaskFooter
        onPrevious={() => undefined}
        canGoToPrevious={false}
        onNext={next}
        canGoToNext={!!savedResponse && !busy}
        onSubmit={() =>
          step.block.mode === "training"
            ? submit(expired ? "timed-out" : "answered")
            : setConfirmOpen(true)
        }
        canSubmit={startedAt !== undefined && !savedResponse}
        isSubmitting={busy}
        isTaskCompleted={!!savedResponse}
        isDomainExpert={false}
      />
    </div>
  );
  return (
    <>
      {chrome}
      <Task
        quiz={step.quiz}
        block={step.block}
        answer={savedResponse?.answer ?? answer}
        onAnswer={setAnswer}
        disabled={busy || !!savedResponse || expired}
        onReady={onReady}
        onEvent={onEvent}
      >
        {panel}
      </Task>
      <ConfirmSubmitModal
        isOpen={confirmOpen}
        onConfirm={() => submit(expired ? "timed-out" : "answered")}
        onCancel={() => setConfirmOpen(false)}
      />
      <IncorrectAnswerModal
        isOpen={incorrectOpen}
        onClose={() => setIncorrectOpen(false)}
      />
    </>
  );
}
