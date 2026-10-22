const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { webcrypto } = require('node:crypto');
const ts = require('typescript');

// Test the real adapter with a controlled Firestore transport. This is not a rules/emulator test.
function setup(mode = 'study') {
  const data = new Map();
  let failure = false;
  const snapshot = (key) => ({ exists: () => data.has(key), data: () => data.get(key) });
  const sdk = {
    'firebase/app': {getApps:()=>[], initializeApp:()=>({})},
    'firebase/auth': {getAuth:()=>({authStateReady:async()=>{}, currentUser:{uid:'owner'}}), signInAnonymously:async()=>({user:{uid:'owner'}})},
    'firebase/firestore': {
      getFirestore:()=>({}), doc:(_, ...parts)=>parts.join('/'),
      getDocFromServer:async(key)=>{if(failure) throw new Error('offline'); return snapshot(key);},
      runTransaction:async(_, run)=>{
        if(failure) throw new Error('offline');
        const writes=[];
        await run({get:async(key)=>snapshot(key),set:(key,value)=>writes.push([key,value])});
        writes.forEach(([key,value])=>data.set(key,value));
      },
    },
  };
  const code=ts.transpileModule(readFileSync(join(__dirname,'../src/study/cloudStore.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};
  new Function('require','exports','crypto',code)((name)=>sdk[name],exports,webcrypto);
  return { store:exports.createCloudStore({mode,storage:'cloud',firebase:{projectId:'synthetic'}}), data, fail:()=>{failure=true;} };
}
const session=(mode='study',revision=0)=>({schemaVersion:2,runMode:mode,id:'s',studyId:'demo',studyVersion:'1',revision,events:[],cursor:0});
test('cloud adapter writes owner-scoped formal snapshots and rejects test data',async()=>{
  const mock=setup(); const store=await mock.store;
  await store.save('key',session(),null);
  assert.match([...mock.data.keys()][0],/^studySessions\/owner\/sessions\/[a-f0-9]{64}$/);
  assert.equal((await store.load('key')).runMode,'study');
  await assert.rejects(store.save('key',session('dev'),0),/cross-mode/);
  await assert.rejects(store.save('key',session('study',1),99),/another tab/);
  assert.equal((await store.load('key')).revision,0);
});
test('cloud tests use a separate collection; offline failures do not advance stored state',async()=>{
  const mock=setup('dev'); const store=await mock.store;
  await store.save('key',session('dev'),null);
  const key=[...mock.data.keys()][0];
  assert.match(key,/^testSessions\//);
  mock.fail();
  await assert.rejects(store.save('key',session('dev',1),0),/offline/);
  await assert.rejects(store.load('key'),/offline/);
  assert.equal(mock.data.get(key).revision,0);
});
test('cloud reads reject corrupt cross-mode envelopes and oversized snapshots',async()=>{
  const mock=setup(); const store=await mock.store;
  await store.save('key',session(),null);
  const key=[...mock.data.keys()][0];
  mock.data.set(key,{...mock.data.get(key),runMode:'dev'});
  await assert.rejects(store.load('key'),/different owner or mode/);
  await assert.rejects(store.save('large',{...session(),extra:'x'.repeat(900001)},null),/capacity/);
});
