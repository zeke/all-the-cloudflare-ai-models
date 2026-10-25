import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {normalize, validate, compare, blobHash} from '../scripts/catalog.mjs';
const require = createRequire(import.meta.url);
const models = require('../index.json');
test('complete catalog validates and has unique route identifiers', () => validate(models));
test('package exports the JSON array through require and import', async () => {
  assert.deepEqual(require('all-the-cloudflare-ai-models'), models);
  assert.deepEqual((await import('all-the-cloudflare-ai-models', {with: {type: 'json'}})).default, models);
});
test('snapshot provenance accounts for every exported record', async () => {
  const sources = JSON.parse(await readFile(new URL('../sources.json', import.meta.url)));
  assert.equal(sources.files.length, models.length);
  assert.equal(sources.counts['workers-ai'] + sources.counts['ai-gateway'], models.length);
  assert.deepEqual(sources.files.map(f => f.path).sort(), models.map(m => m.source).sort());
  assert(sources.files.every(f => /^[a-f0-9]{40}$/.test(f.sha)));
});
test('empty, partial, duplicate, unsorted and removed catalogs fail closed', () => {
  assert.throws(() => validate([]));
  assert.throws(() => validate(models.filter(m => m.route === 'workers-ai')));
  assert.throws(() => validate([...models, models[0]]));
  assert.throws(() => validate([...models].reverse()));
  assert.throws(() => validate(models.slice(1), models), /removals/);
});
test('normalization preserves canonical IDs and separate routes', () => {
  const model = 'example/model';
  const common = {name: model, description: 'Description', task: 'Text Generation', provider_id: 'example', model_id: model};
  const gateway = normalize(common, 'src/content/catalog-models/test.json');
  const hosted = normalize({...common, task: {name: common.task}}, 'src/content/workers-ai-models/test.json');
  assert.equal(gateway.model, hosted.model);
  assert.notEqual(gateway.id, hosted.id);
  assert.equal(gateway.provider, 'example');
  assert.equal(hosted.provider, 'workers-ai');
  assert.throws(() => normalize({}, 'src/content/catalog-models/bad.json'));
});
test('git blob hashing uses Git framing', () => assert.equal(blobHash(Buffer.from('test\n')), '9daeafb9864cf43055ae93beb0afd6c7d144bfa4'));
test('fetch failure leaves both snapshots unchanged', async () => {
  const before = await Promise.all(['index.json', 'sources.json'].map(p => readFile(new URL('../' + p, import.meta.url), 'utf8')));
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ok: false, status: 503});
  try {
    const {update} = await import('../scripts/update.mjs');
    await assert.rejects(update(), /503/);
  } finally { globalThis.fetch = original; }
  const after = await Promise.all(['index.json', 'sources.json'].map(p => readFile(new URL('../' + p, import.meta.url), 'utf8')));
  assert.deepEqual(after, before);
});
