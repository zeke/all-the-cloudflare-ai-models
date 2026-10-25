import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {normalize, validate, serialize, compare, blobHash} from './catalog.mjs';
import {diffCatalog, appendChangelog} from './changes.mjs';
import {commitFiles} from './files.mjs';
const defaultRoot = new URL('../', import.meta.url);
const api = 'https://api.github.com/repos/cloudflare/cloudflare-docs';
async function get(url, json = true, fetcher = globalThis.fetch) {
  let error;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const headers = {'User-Agent': 'all-the-cloudflare-ai-models'};
      if (url.startsWith(api) && process.env.GH_TOKEN) headers.Authorization = `Bearer ${process.env.GH_TOKEN}`;
      const response = await fetcher(url, {headers, signal: AbortSignal.timeout(60000)});
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
      return json ? await response.json() : Buffer.from(await response.arrayBuffer());
    } catch (e) { error = e; if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); }
  }
  throw error;
}
export async function update({root = defaultRoot, fetcher = globalThis.fetch, date = new Date().toISOString().slice(0, 10)} = {}) {
  const tree = await get(`${api}/git/trees/production?recursive=1`, true, fetcher);
  assert.equal(tree.truncated, false, 'Truncated source tree');
  assert.match(tree.sha, /^[a-f0-9]{40}$/);
  const files = tree.tree.filter(f => /^src\/content\/(catalog-models|workers-ai-models)\/[^/]+\.json$/.test(f.path));
  assert(files.every(f => f.type === 'blob'), 'Unexpected source entry');
  const models = [];
  let cursor = 0;
  await Promise.all(Array.from({length: 8}, async () => {
    while (cursor < files.length) {
      const file = files[cursor++];
      const bytes = await get(`https://raw.githubusercontent.com/cloudflare/cloudflare-docs/${tree.sha}/${file.path}`, false, fetcher);
      assert.equal(blobHash(bytes), file.sha, `Source hash mismatch: ${file.path}`);
      models.push(normalize(JSON.parse(bytes.toString()), file.path));
    }
  }));
  assert.equal(models.length, files.length, 'Incomplete fetch');
  models.sort((a, b) => compare(a.id, b.id));
  let previous = [];
  try { previous = JSON.parse(await readFile(new URL('index.json', root), 'utf8')); }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
  validate(models, previous);
  const diff = diffCatalog(previous, models);
  if (!diff.hasChanges) { console.log(`No changes: ${models.length} catalog entries`); return; }
  const output = serialize(models);
  const previousSources = previous.length ? JSON.parse(await readFile(new URL('sources.json', root), 'utf8')) : {};
  let changelog = '';
  try { changelog = await readFile(new URL('CHANGELOG.md', root), 'utf8'); }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
  const sources = {
    repository: 'https://github.com/cloudflare/cloudflare-docs',
    revision: tree.sha,
    catalog: 'https://developers.cloudflare.com/ai/models/',
    counts: Object.fromEntries(['workers-ai', 'ai-gateway'].map(route => [route, models.filter(m => m.route === route).length])),
    files: files.sort((a, b) => compare(a.path, b.path)).map(({path, sha}) => ({path, sha}))
  };
  const nextChangelog = appendChangelog(changelog, diff, {date, revision: tree.sha, previousRevision: previousSources.revision});
  await commitFiles(root, {'index.json': output, 'sources.json': serialize(sources), 'CHANGELOG.md': nextChangelog});
  console.log(`Updated ${models.length} catalog entries from ${tree.sha}: ${diff.added.length} added, ${diff.removed.length} removed, ${diff.changed.length} changed`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) update().catch(e => { console.error(e.message); process.exitCode = 1; });
