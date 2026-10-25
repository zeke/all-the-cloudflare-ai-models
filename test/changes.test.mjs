import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {diffCatalog, appendChangelog, changelogHeader, counts} from '../scripts/changes.mjs';
import {commitFiles} from '../scripts/files.mjs';
import {blobHash, serialize, compare} from '../scripts/catalog.mjs';
import {update} from '../scripts/update.mjs';
const entry = (id, extra = {}) => ({id: `ai-gateway:${id}`, model: id, route: 'ai-gateway', task: 'Text Generation', description: 'Old', ...extra});
const details = {date: '2026-10-25', revision: 'a'.repeat(40), previousRevision: 'b'.repeat(40)};
test('summaries identify additions, removals, metadata changes and no-op checks', () => {
  const old = [entry('example/removed'), entry('example/changed'), entry('example/unchanged')];
  const next = [entry('example/unchanged'), entry('example/added'), entry('example/changed', {description: 'New', provider_details: [{id: 'new-route'}]})];
  const diff = diffCatalog(old, next);
  assert.deepEqual(diff.added.map(m => m.model), ['example/added']);
  assert.deepEqual(diff.removed.map(m => m.model), ['example/removed']);
  assert.deepEqual(diff.changed[0].fields.map(f => f.field), ['description', 'provider_details']);
  const log = appendChangelog(changelogHeader, diff, details);
  for (const text of ['2026-10-25', '1 added, 1 removed, 1 changed', 'example/added', 'example/removed', 'description:', 'provider_details:', '3 (+0)', 'source diff']) assert(log.includes(text), text);
  assert.equal(appendChangelog(changelogHeader, diff, details), log);
  assert.equal(diffCatalog(old, [...old].reverse()).hasChanges, false);
  assert.equal(appendChangelog(log, diffCatalog(next, next), {...details, date: '2026-10-26'}), log);
  const reordered = entry('example/changed', {provider_details: [{b: 2, a: 1}]});
  assert.equal(diffCatalog([reordered], [entry('example/changed', {provider_details: [{a: 1, b: 2}]})]).hasChanges, false);
});
test('counts and route changes never conflate entries with underlying models', () => {
  const gateway = entry('example/shared');
  const hosted = {...gateway, id: 'workers-ai:example/shared', route: 'workers-ai'};
  assert.deepEqual(counts([gateway, hosted]), {entries: 2, workersAI: 1, aiGateway: 1, modelIDs: 1});
  const diff = diffCatalog([gateway], [hosted]);
  assert.equal(diff.removed.length, 1);
  assert.equal(diff.added.length, 1);
  assert.equal(diff.changed.length, 0);
  assert.equal(diff.before.modelIDs, diff.after.modelIDs);
});
async function temporary(t) {
  const directory = await fs.mkdtemp(join(tmpdir(), 'cloudflare-changelog-test-'));
  t.after(() => fs.rm(directory, {recursive: true, force: true}));
  return pathToFileURL(directory + '/');
}
test('staging failure and mid-replacement failure restore all outputs', async t => {
  const root = await temporary(t);
  const originals = {'index.json': 'old models', 'sources.json': 'old sources', 'CHANGELOG.md': 'old log'};
  for (const [file, data] of Object.entries(originals)) await fs.writeFile(new URL(file, root), data);
  let writes = 0;
  await assert.rejects(commitFiles(root, {'index.json': 'new', 'sources.json': 'new', 'CHANGELOG.md': 'new'}, {
    ...fs, writeFile: async (...args) => { if (++writes === 2) throw new Error('staging failure'); return fs.writeFile(...args); }
  }), /staging failure/);
  let renames = 0;
  await assert.rejects(commitFiles(root, {'index.json': 'new', 'sources.json': 'new', 'CHANGELOG.md': 'new'}, {
    ...fs, rename: async (...args) => { if (++renames === 3) throw new Error('replacement failure'); return fs.rename(...args); }
  }), /replacement failure/);
  for (const [file, data] of Object.entries(originals)) assert.equal(await fs.readFile(new URL(file, root), 'utf8'), data);
  assert.deepEqual((await fs.readdir(root)).sort(), Object.keys(originals).sort());
});
test('a validated update commits matching snapshots and one changelog entry; repeated fetch is a byte-identical no-op', async t => {
  const root = await temporary(t);
  for (const file of ['index.json', 'sources.json', 'CHANGELOG.md']) await fs.copyFile(new URL('../' + file, import.meta.url), new URL(file, root));
  const previous = JSON.parse(await fs.readFile(new URL('index.json', root), 'utf8'));
  const next = previous.slice(1).map((m, i) => i === 0 ? {...m, description: m.description + ' Updated.'} : m);
  next.push({...previous[0], id: 'ai-gateway:example/new', model: 'example/new', name: 'New model', provider: 'example', source: 'src/content/catalog-models/example-new.json', documentation: 'https://developers.cloudflare.com/ai/models/example/new/'});
  next.sort((a, b) => compare(a.id, b.id));
  const blobs = new Map(next.map(m => {
    const data = {
      model_id: m.model, name: m.route === 'workers-ai' ? m.model : m.name, provider_id: m.provider,
      description: m.description, task: m.route === 'workers-ai' ? {name: m.task} : m.task,
      providers: m.providers, provider_details: m.provider_details, request_formats: m.request_formats,
      metadata: {planned_deprecation_date: m.planned_deprecation_date},
      properties: [{property_id: 'planned_deprecation_date', value: m.planned_deprecation_date}]
    };
    return [m.source, Buffer.from(serialize(data))];
  }));
  const fetcher = async url => url.includes('/git/trees/')
    ? {ok: true, json: async () => ({truncated: false, sha: details.revision, tree: [...blobs].map(([path, bytes]) => ({path, type: 'blob', sha: blobHash(bytes)}))})}
    : {ok: true, arrayBuffer: async () => blobs.get(url.slice(url.indexOf('src/content/')))};
  await update({root, fetcher, date: details.date});
  assert.deepEqual(JSON.parse(await fs.readFile(new URL('index.json', root), 'utf8')), next);
  const source = JSON.parse(await fs.readFile(new URL('sources.json', root), 'utf8'));
  assert.equal(source.revision, details.revision);
  const log = await fs.readFile(new URL('CHANGELOG.md', root), 'utf8');
  assert(log.includes('1 added, 1 removed, 1 changed'));
  const before = await Promise.all(['index.json', 'sources.json', 'CHANGELOG.md'].map(async file => [await fs.readFile(new URL(file, root), 'utf8'), (await fs.stat(new URL(file, root))).mtimeMs]));
  await update({root, fetcher, date: '2026-10-26'});
  const after = await Promise.all(['index.json', 'sources.json', 'CHANGELOG.md'].map(async file => [await fs.readFile(new URL(file, root), 'utf8'), (await fs.stat(new URL(file, root))).mtimeMs]));
  assert.deepEqual(after, before);
});
