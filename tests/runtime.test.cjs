const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const ts = require('typescript');
const compiled = mkdtempSync(join(tmpdir(), 'study-runtime-'));
mkdirSync(join(compiled, 'debug'));
for (const name of ['runtime', 'store', 'engine', 'debug/navigation']) {
  writeFileSync(join(compiled, `${name}.js`), ts.transpileModule(readFileSync(join(__dirname, `../src/study/${name}.ts`), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText);
}
process.on('exit', () => rmSync(compiled, {recursive:true, force:true}));
const { readRuntime, readRecruitment } = require(join(compiled, 'runtime.js'));
const { LocalStudyStore } = require(join(compiled, 'store.js'));
const { debugJump } = require(join(compiled, 'debug/navigation.js'));
const { createSession, stepsFor } = require(join(compiled, 'engine.js'));
const formal = { VITE_STUDY_CONSENT_TEXT:'Study consent', VITE_STUDY_CONSENT_VERSION:'1', VITE_COMPLETION_URL:'https://app.prolific.com/submissions/complete?cc=test', VITE_STUDY_FIREBASE_API_KEY:'synthetic', VITE_STUDY_FIREBASE_AUTH_DOMAIN:'synthetic.firebaseapp.com', VITE_STUDY_FIREBASE_PROJECT_ID:'formal', VITE_STUDY_FIREBASE_APP_ID:'synthetic' };
const study = {id:'demo',version:'1',consent:{version:'1'},blocks:[{id:'b',mode:'task',quizzes:[{id:'q',response:{type:'text'}}]}]};
const recruitment = {platform:'demo', participantId:'test'};

test('mode comes from build configuration; formal deployments fail closed', () => {
  assert.equal(readRuntime({DEV:true}).mode, 'dev');
  assert.throws(() => readRuntime({DEV:false}), /consent/);
  assert.equal(readRuntime({...formal,DEV:false,VITE_DEV_STORAGE:'local'}).storage, 'cloud');
  assert.throws(() => readRuntime({...formal,VITE_RUN_MODE:'debug'}), /Invalid/);
  assert.throws(() => readRuntime({...formal,VITE_STUDY_FIREBASE_APP_ID:''}), /cannot fall back/);
  assert.throws(() => readRuntime({...formal,VITE_COMPLETION_URL:'javascript:alert(1)'}), /HTTPS/);
});
test('test cloud configuration cannot reuse formal project or fall back to its credentials', () => {
  assert.throws(() => readRuntime({...formal,DEV:true,VITE_DEV_STORAGE:'cloud'}), /VITE_DEV_FIREBASE_API_KEY/);
  const dev = { ...formal, DEV:true, VITE_DEV_STORAGE:'cloud', VITE_DEV_FIREBASE_API_KEY:'synthetic', VITE_DEV_FIREBASE_AUTH_DOMAIN:'test.firebaseapp.com', VITE_DEV_FIREBASE_PROJECT_ID:'formal', VITE_DEV_FIREBASE_APP_ID:'synthetic' };
  assert.throws(() => readRuntime(dev), /different Firebase projects/);
  assert.equal(readRuntime({...dev,VITE_DEV_FIREBASE_PROJECT_ID:'test'}).firebase.projectId, 'test');
});
test('dev ignores recruitment identifiers and formal mode requires complete identifiers', () => {
  const query = '?mode=dev&debug=true&PROLIFIC_PID=p&STUDY_ID=s&SESSION_ID=r';
  assert.deepEqual(readRecruitment('study', query, 'x'), {platform:'prolific',participantId:'p',studyId:'s',sessionId:'r'});
  assert.deepEqual(readRecruitment('dev', query, 'x'), {platform:'demo',participantId:'test-x'});
  assert.throws(() => readRecruitment('study','?debug=true','x'), /requires/);
});
test('test namespaces cannot load or overwrite a session in another namespace', async () => {
  const data = new Map(); const storage = {getItem:(key)=>data.get(key) ?? null,setItem:(key,value)=>data.set(key,value)};
  const one = new LocalStudyStore(storage,'dev'); const other = new LocalStudyStore(storage,'other');
  const session = createSession(study,recruitment);
  await one.save('same-key',session,null);
  assert.equal(await other.load('same-key'),null);
  assert.equal((await one.load('same-key')).id,session.id);
});
test('debug jumps are logged, bounded and rejected in formal mode', () => {
  assert.throws(() => debugJump('study',study,null,recruitment,1), /disabled/);
  assert.throws(() => debugJump('dev',study,null,recruitment,999), /Invalid/);
  const jumped = debugJump('dev',study,null,recruitment,1);
  assert.equal(jumped.cursor,1);
  assert.equal(jumped.events.at(-1).eventType,'debug-jump');
  assert.equal(jumped.events.at(-1).data.synthetic,true);
});

test('enabled device check precedes every block and quiz', () => {
  const definition = {...study, screenCheck:true};
  const session = createSession(definition, recruitment);
  assert.deepEqual(stepsFor(definition,session).map((step) => step.kind), ['screen-check','block-intro','quiz','study-feedback','finish']);
  assert.equal(session.events[0].eventType,'consent-acknowledged');
});
