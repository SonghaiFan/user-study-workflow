import type {
  Answer,
  FeedbackDefinition,
  Quiz,
  Recruitment,
  Session,
  Step,
  Study,
  Submission,
} from "./types";

export function assertStudy(study: Study) {
  if (
    !study.id ||
    !study.version ||
    !study.consent.version ||
    !study.blocks.length
  )
    throw new Error("Study needs an ID, version, consent version and blocks.");
  const feedbackDefinitions = [study.feedback, ...study.blocks.map((block) => block.feedback)];
  for (const definition of feedbackDefinitions) {
    if (!definition || typeof definition !== "object") continue;
    if (!definition.pages.length || definition.pages.some((page) => !page.fields.length))
      throw new Error("Feedback needs non-empty pages and fields.");
    const ids = definition.pages.flatMap((page) => page.fields.map((field) => field.id));
    if (ids.some((id) => !id) || new Set(ids).size !== ids.length)
      throw new Error("Feedback field IDs must be unique across pages.");
  }
  const blocks = new Set<string>();
  for (const block of study.blocks) {
    if (!block.id || blocks.has(block.id) || !block.quizzes.length)
      throw new Error("Block IDs must be unique and blocks need quizzes.");
    blocks.add(block.id);
    const quizzes = new Set<string>();
    for (const quiz of block.quizzes) {
      if (!quiz.id || quizzes.has(quiz.id))
        throw new Error("Quiz IDs must be unique within a block.");
      quizzes.add(quiz.id);
      if (
        quiz.timeLimitSeconds !== undefined &&
        (!Number.isFinite(quiz.timeLimitSeconds) || quiz.timeLimitSeconds <= 0)
      )
        throw new Error("Invalid quiz time limit.");
      if (
        "options" in quiz.response &&
        (!quiz.response.options.length ||
          new Set(quiz.response.options.map((o) => o.id)).size !==
            quiz.response.options.length)
      )
        throw new Error("Response options must have unique IDs.");
    }
  }
}
export function quizKey(blockId: string, quizId: string) {
  return JSON.stringify([blockId, quizId]);
}
export function stepsFor(study: Study, session: Session): Step[] {
  if (study.id !== session.studyId || study.version !== session.studyVersion)
    throw new Error("This saved session uses a different study version.");
  return [
    ...(study.screenCheck ? [{ kind: "screen-check" as const }] : []),
    ...study.blocks.flatMap((block): Step[] => {
      const order = session.orders[block.id];
      if (
        !order ||
        order.length !== block.quizzes.length ||
        new Set(order).size !== order.length
      )
        throw new Error("Saved task order is invalid.");
      const quizzes = order.map((id) => {
        const quiz = block.quizzes.find((q) => q.id === id);
        if (!quiz) throw new Error("Saved quiz is missing from the study.");
        return { kind: "quiz" as const, block, quiz };
      });
      return [
        { kind: "block-intro", block },
        ...quizzes,
        ...(block.feedback ? [{ kind: "block-feedback" as const, block }] : []),
      ];
    }),
    ...(study.feedback === false ? [] : [{ kind: "study-feedback" as const }]),
    { kind: "finish" },
  ];
}
export function currentStep(study: Study, session: Session) {
  const step = stepsFor(study, session)[session.cursor];
  if (!step) throw new Error("Saved progress is invalid.");
  return step;
}
function event(
  session: Session,
  type: string,
  data: Record<string, unknown>,
  now: number,
) {
  session.events.push({
    schemaVersion: 2,
    eventId: crypto.randomUUID(),
    studyId: session.studyId,
    studyVersion: session.studyVersion,
    sessionId: session.id,
    participantId: session.recruitment.participantId,
    eventType: type,
    occurredAt: new Date(now).toISOString(),
    data,
  });
}
function edit(session: Session): Session {
  return { ...structuredClone(session), revision: session.revision + 1 };
}
export function createSession(
  study: Study,
  recruitment: Recruitment,
  now = Date.now(),
  random = Math.random,
): Session {
  assertStudy(study);
  const orders: Session["orders"] = {};
  for (const block of study.blocks) {
    const ids = block.quizzes.map((q) => q.id);
    if (block.order === "shuffle")
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
    orders[block.id] = ids;
  }
  const session: Session = {
    schemaVersion: 2,
    id: crypto.randomUUID(),
    studyId: study.id,
    studyVersion: study.version,
    recruitment,
    revision: 0,
    cursor: 0,
    orders,
    presentedAt: {},
    responses: {},
    events: [],
    completed: false,
  };
  event(
    session,
    "consent-acknowledged",
    { consentVersion: study.consent.version },
    now,
  );
  event(session, "session-started", { orders }, now);
  return session;
}
export function presentQuiz(
  study: Study,
  session: Session,
  now = Date.now(),
): Session {
  const step = currentStep(study, session);
  if (step.kind !== "quiz" || session.completed) return session;
  const key = quizKey(step.block.id, step.quiz.id);
  if (session.presentedAt[key] !== undefined) return session;
  const next = edit(session);
  next.presentedAt[key] = now;
  event(
    next,
    "quiz-presented",
    {
      blockId: step.block.id,
      quizId: step.quiz.id,
      stimulusId: step.quiz.stimulusId,
      condition: step.block.condition,
      mode: step.block.mode,
    },
    now,
  );
  return next;
}
export function answerError(quiz: Quiz, answer: Answer): string | null {
  const empty =
    answer === null ||
    answer === "" ||
    (Array.isArray(answer) && !answer.length);
  if (empty)
    return quiz.required === false ? null : "Please answer this question.";
  const response = quiz.response;
  if (response.type === "text")
    return typeof answer === "string" &&
      answer.trim().length > 0 &&
      answer.length <= (response.maxLength ?? 10000)
      ? null
      : "Enter a valid text answer.";
  if (response.type === "rating")
    return typeof answer === "number" &&
      Number.isInteger(answer) &&
      answer >= response.min &&
      answer <= response.max
      ? null
      : "Choose a rating.";
  const ids = response.options.map((o) => o.id);
  if (response.type === "single-choice")
    return typeof answer === "string" && ids.includes(answer)
      ? null
      : "Choose one option.";
  if (response.type === "pairing") {
    if (!answer || typeof answer !== "object" || Array.isArray(answer))
      return "Match every item.";
    return Object.keys(answer).length === ids.length &&
      ids.every((id) => response.targets.some((t) => t.id === answer[id]))
      ? null
      : "Match every item.";
  }
  return Array.isArray(answer) &&
    answer.every((id) => ids.includes(id)) &&
    new Set(answer).size === answer.length &&
    (response.type !== "ranking" || answer.length === ids.length)
    ? null
    : "Choose valid options.";
}
export function answersEqual(a: Answer, b: Answer, quiz: Quiz) {
  if (
    quiz.response.type === "multiple-choice" &&
    Array.isArray(a) &&
    Array.isArray(b)
  )
    return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
  if (
    quiz.response.type === "pairing" &&
    a &&
    b &&
    typeof a === "object" &&
    typeof b === "object" &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  )
    return (
      Object.keys(a).length === Object.keys(b).length &&
      Object.keys(a).every((k) => a[k] === b[k])
    );
  return JSON.stringify(a) === JSON.stringify(b);
}
export function submitQuiz(
  study: Study,
  session: Session,
  submission: Submission,
  now = Date.now(),
): Session {
  const step = currentStep(study, session);
  if (step.kind !== "quiz" || session.completed)
    throw new Error("No active quiz.");
  const key = quizKey(step.block.id, step.quiz.id);
  if (session.responses[key]) return session; // duplicate click/retry
  const started = session.presentedAt[key];
  if (started === undefined)
    throw new Error("Wait for the material to be ready.");
  const expired =
    step.quiz.timeLimitSeconds !== undefined &&
    now - started >= step.quiz.timeLimitSeconds * 1000;
  if (submission.outcome === "timed-out" && !expired)
    throw new Error("The quiz has not timed out.");
  const result = {
    ...submission,
    outcome: expired ? ("timed-out" as const) : submission.outcome,
  };
  if (result.outcome === "skipped" && !step.quiz.allowSkip)
    throw new Error("Skipping is disabled.");
  if (result.outcome === "answered") {
    const error = answerError(step.quiz, result.answer);
    if (error) throw new Error(error);
    if (step.quiz.collectReasoning && !result.reasoning?.trim())
      throw new Error("Please explain your answer.");
    if (
      step.quiz.collectConfidence &&
      (typeof result.confidence !== "number" ||
        !Number.isInteger(result.confidence) ||
        result.confidence < 1 ||
        result.confidence > 5)
    )
      throw new Error("Choose your confidence (1–5).");
  }
  const next = edit(session);
  const correct =
    step.quiz.correctAnswer === undefined
      ? undefined
      : answersEqual(result.answer, step.quiz.correctAnswer, step.quiz);
  const retry =
    step.block.mode === "training" &&
    correct === false &&
    result.outcome === "answered";
  event(
    next,
    "quiz-submitted",
    {
      blockId: step.block.id,
      quizId: step.quiz.id,
      stimulusId: step.quiz.stimulusId,
      mode: step.block.mode,
      condition: step.block.condition,
      ...result,
      correct,
      retry,
      durationMs: Math.max(0, now - started),
    },
    now,
  );
  if (!retry) next.responses[key] = result;
  return next;
}
export function advance(
  study: Study,
  session: Session,
  feedback: string | Record<string, unknown> = "",
  now = Date.now(),
): Session {
  if (session.completed) return session;
  const step = currentStep(study, session);
  if (
    step.kind === "quiz" &&
    !session.responses[quizKey(step.block.id, step.quiz.id)]
  )
    throw new Error("Save an answer before continuing.");
  if (step.kind === "finish")
    throw new Error("Use finalization to complete the study.");
  const definition = step.kind === "study-feedback" ? study.feedback : step.kind === "block-feedback" ? step.block.feedback : undefined;
  if (definition && typeof definition === "object") {
    const payload = feedback && typeof feedback === "object" ? feedback as Record<string, unknown> : {};
    const answers = payload.answers && typeof payload.answers === "object" ? payload.answers as Record<string, Answer> : {};
    const errors = feedbackErrors(definition, answers);
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  }
  const next = edit(session);
  event(
    next,
    step.kind.endsWith("feedback") ? step.kind : "step-completed",
    {
      step: step.kind,
      ...("block" in step ? { blockId: step.block.id } : {}),
      ...(step.kind.endsWith("feedback") ? { feedback } : {}),
    },
    now,
  );
  next.cursor++;
  return next;
}
export function finalize(
  study: Study,
  session: Session,
  now = Date.now(),
  mode: "dev" | "study" = "study",
): Session {
  if (session.completed) return session;
  if (currentStep(study, session).kind !== "finish")
    throw new Error("Complete all study steps before finishing.");
  const missingQuizzes = study.blocks.some((block) =>
    block.quizzes.some((quiz) => !session.responses[quizKey(block.id, quiz.id)]));
  const missingFeedback = (study.feedback !== false && !session.events.some((item) => item.eventType === "study-feedback")) ||
    study.blocks.some((block) => block.feedback && !session.events.some((item) => item.eventType === "block-feedback" && item.data.blockId === block.id));
  if (mode === "study" && missingQuizzes) throw new Error("Complete all quizzes before finishing.");
  if (mode === "study" && missingFeedback) throw new Error("Complete all feedback before finishing.");
  const preview = mode === "dev" && (missingQuizzes || missingFeedback);
  const next = edit(session);
  next.completed = true;
  event(next, preview ? "debug-completion-preview" : "session-completed", preview ? { synthetic: true, missingQuizzes, missingFeedback } : {}, now);
  return next;
}
export function recordInteraction(
  study: Study,
  session: Session,
  name: string,
  payload: Record<string, unknown>,
  now = Date.now(),
): Session {
  const step = currentStep(study, session);
  if (step.kind !== "quiz" || session.completed) return session;
  const next = edit(session);
  event(
    next,
    "task-interaction",
    { blockId: step.block.id, quizId: step.quiz.id, name, payload },
    now,
  );
  return next;
}

/** Validate configured feedback at both the UI and persistence boundary. */
export function feedbackErrors(definition: FeedbackDefinition, answers: Record<string, Answer>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const page of definition.pages) for (const field of page.fields) {
    const error = answerError({ id: field.id, stimulusId: "feedback", question: field.label, response: field.response, required: field.required }, answers[field.id] ?? null);
    if (error) errors[field.id] = `${field.label}: ${error}`;
  }
  return errors;
}
