const { test } = require("node:test");
const assert = require("node:assert/strict");
const { mkdtempSync, rmSync, writeFileSync, readFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const ts = require("typescript");
const compiled = mkdtempSync(join(tmpdir(), "study-engine-"));
for (const name of ["engine", "store"])
  writeFileSync(
    join(compiled, `${name}.cjs`),
    ts.transpileModule(
      readFileSync(join(__dirname, `../src/study/${name}.ts`), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
  );
const {
  assertStudy,
  createSession,
  advance,
  presentQuiz,
  submitQuiz,
  finalize,
  stepsFor,
  quizKey,
  answerError,
} = require(join(compiled, "engine.cjs"));
const { LocalStudyStore } = require(join(compiled, "store.cjs"));
process.on("exit", () => rmSync(compiled, { recursive: true, force: true }));
const study = {
  id: "test",
  version: "1",
  consent: { version: "1" },
  blocks: [
    {
      id: "b",
      mode: "task",
      order: "shuffle",
      quizzes: [
        {
          id: "one",
          stimulusId: "s",
          response: {
            type: "single-choice",
            options: [{ id: "a" }, { id: "b" }],
          },
          correctAnswer: "a",
          timeLimitSeconds: 10,
        },
        { id: "two", stimulusId: "s", response: { type: "text" } },
      ],
    },
  ],
};
const start = (definition = study) =>
  createSession(
    definition,
    { platform: "demo", participantId: "synthetic" },
    1000,
    () => 0.9,
  );
const submission = { answer: "a", outcome: "answered" };
test("random order survives serialization and version mismatches fail", () => {
  const s = start();
  assert.deepEqual(
    stepsFor(study, JSON.parse(JSON.stringify(s))),
    stepsFor(study, s),
  );
  assert.throws(
    () => stepsFor({ ...study, version: "2" }, s),
    /different study version/,
  );
});
test("presentation starts the clock; reload preserves timing; submission is idempotent", () => {
  let s = advance(study, start());
  assert.deepEqual(s.presentedAt, {});
  assert.throws(() => submitQuiz(study, s, submission), /material/);
  s = presentQuiz(study, s, 5000);
  assert.equal(presentQuiz(study, s, 6000), s);
  assert.throws(() => advance(study, s), /Save an answer/);
  const next = submitQuiz(
    study,
    JSON.parse(JSON.stringify(s)),
    submission,
    8000,
  );
  assert.equal(next.events.at(-1).data.durationMs, 3000);
  assert.equal(submitQuiz(study, next, submission, 9000), next);
  assert.equal(s.responses[quizKey("b", "one")], undefined);
});
test("early timeout and disallowed skip fail; late answers become timed-out", () => {
  const s = presentQuiz(study, advance(study, start()), 5000);
  assert.throws(
    () => submitQuiz(study, s, { ...submission, outcome: "timed-out" }, 6000),
    /not timed out/,
  );
  assert.equal(
    submitQuiz(study, s, submission, 16000).responses[quizKey("b", "one")]
      .outcome,
    "timed-out",
  );
  assert.throws(
    () => submitQuiz(study, s, { ...submission, outcome: "skipped" }, 6000),
    /Skipping/,
  );
});
test("incorrect training attempts are recorded without advancing", () => {
  const training = {
    ...study,
    blocks: [{ ...study.blocks[0], mode: "training" }],
  };
  let s = presentQuiz(training, advance(training, start(training)), 5000);
  s = submitQuiz(training, s, { answer: "b", outcome: "answered" }, 6000);
  assert.equal(s.cursor, 1);
  assert.equal(s.events.at(-1).data.retry, true);
  assert.throws(() => advance(training, s), /Save an answer/);
  s = submitQuiz(training, s, submission, 7000);
  assert.equal(s.responses[quizKey("b", "one")].answer, "a");
});
test("completion requires the full workflow and is idempotent", () => {
  let s = start();
  assert.throws(() => finalize(study, s), /Complete all/);
  s = presentQuiz(study, advance(study, s), 5000);
  s = advance(study, submitQuiz(study, s, submission, 6000));
  s = presentQuiz(study, s, 7000);
  s = advance(
    study,
    submitQuiz(study, s, { answer: "text", outcome: "answered" }, 8000),
  );
  s = advance(study, s, "feedback");
  const completed = finalize(study, s, 9000);
  assert.equal(completed.completed, true);
  assert.equal(finalize(study, completed), completed);
  assert.equal(
    completed.events.filter((e) => e.eventType === "session-completed").length,
    1,
  );
});
test("failed saves preserve progress; stale revisions and corrupt JSON fail visibly", async () => {
  const data = new Map();
  let fail = false;
  const store = new LocalStudyStore({
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      if (fail) throw new Error("quota");
      data.set(k, v);
    },
  });
  const initial = start();
  await store.save("k", initial, null);
  fail = true;
  await assert.rejects(store.save("k", advance(study, initial), 0), /quota/);
  assert.equal((await store.load("k")).cursor, 0);
  fail = false;
  await assert.rejects(
    store.save("k", advance(study, initial), 99),
    /another tab/,
  );
  data.set("dev:bad", "{");
  await assert.rejects(store.load("bad"));
});
test("generic response validation covers text, rating, multiple choice, ranking and pairing", () => {
  const q = (response) => ({ response });
  const options = [{ id: "a" }, { id: "b" }];
  assert.ok(answerError(q({ type: "text" }), "   "));
  assert.ok(answerError(q({ type: "rating", min: 1, max: 5 }), 6));
  assert.ok(answerError(q({ type: "multiple-choice", options }), ["a", "a"]));
  assert.ok(answerError(q({ type: "ranking", options }), ["a"]));
  assert.equal(answerError(q({ type: "ranking", options }), ["b", "a"]), null);
  assert.equal(
    answerError(q({ type: "pairing", options, targets: options }), {
      a: "b",
      b: "a",
    }),
    null,
  );
});

test("demo covers training transition, both feedback stages and durable completion", () => {
  const module = { exports: {} };
  const compiledStudy = ts.transpileModule(readFileSync(join(__dirname, "../src/studies/demo/study.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("exports", compiledStudy)(module.exports);
  const demo = module.exports.study;
  let session = start(demo);
  const flow = stepsFor(demo, session);
  assert.equal(flow[0].kind, "screen-check");
  assert.ok(demo.blocks[0].introduction.some((slide) => slide.video));
  assert.equal(demo.blocks[1].introduction[0].notice.tone, "success");
  assert.ok(flow.some((step) => step.kind === "block-feedback"));
  while (flow[session.cursor].kind !== "finish") {
    const step = flow[session.cursor];
    if (step.kind === "quiz") {
      session = presentQuiz(demo, session);
      const r = step.quiz.response;
      const answer = step.quiz.correctAnswer ?? (r.type === "text" ? "Synthetic response" : r.type === "rating" ? r.min : r.type === "single-choice" ? r.options[0].id : r.type === "pairing" ? Object.fromEntries(r.options.map((o) => [o.id, r.targets[0].id])) : r.options.map((o) => o.id));
      session = advance(demo, submitQuiz(demo, session, {answer, outcome:"answered"}));
    } else if (step.kind.endsWith("feedback")) {
      assert.throws(() => advance(demo, session, {answers:{}}));
      const definition = step.kind === "block-feedback" ? step.block.feedback : demo.feedback;
      const answers = Object.fromEntries(definition.pages.flatMap((page) => page.fields.map((field) => [field.id, field.response.type === "rating" ? 4 : "Synthetic feedback"])));
      session = advance(demo, session, {answers, feedbackDuration:1000});
    } else session = advance(demo, session);
  }
  const incomplete = {...session, events:session.events.filter((event) => event.eventType !== "block-feedback")};
  assert.throws(() => finalize(demo, incomplete), /feedback/);
  assert.equal(finalize(demo, session).completed, true);
  const invalid = structuredClone(demo);
  invalid.feedback.pages[1].fields[0].id = invalid.feedback.pages[0].fields[0].id;
  assert.throws(() => assertStudy(invalid), /unique/);
});

test("debug can preview completion without answers while formal mode stays guarded", () => {
  const initial = start();
  const finish = {...initial, cursor:stepsFor(study, initial).length - 1};
  assert.throws(() => finalize(study, finish, 9000, "study"), /quizzes/);
  const preview = finalize(study, finish, 9000, "dev");
  assert.equal(preview.completed, true);
  assert.equal(Object.keys(preview.responses).length,0);
  assert.equal(preview.events.at(-1).eventType, "debug-completion-preview");
  assert.equal(preview.events.at(-1).data.synthetic, true);
  assert.equal(preview.events.some((event) => event.eventType === "session-completed"),false);
  assert.equal(finalize(study,preview,9100,"dev"),preview);
});
