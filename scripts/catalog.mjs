import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
export const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
export const serialize = value => JSON.stringify(value, null, 2) + '\n';
export function blobHash(bytes) {
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}
export function normalize(data, path) {
  const hosted = path.startsWith('src/content/workers-ai-models/');
  const model = hosted ? data.name : data.model_id;
  assert.equal(typeof model, 'string', `Missing model ID: ${path}`);
  assert(model.includes('/'), `Invalid model ID: ${path}`);
  const provider = hosted ? 'workers-ai' : data.provider_id;
  assert.equal(typeof provider, 'string', `Missing provider ID: ${path}`);
  const task = hosted ? data.task?.name : data.task;
  assert.equal(typeof task, 'string', `Missing task: ${path}`);
  assert.equal(typeof data.description, 'string', `Missing description: ${path}`);
  return {
    id: `${hosted ? 'workers-ai' : 'ai-gateway'}:${model}`,
    model,
    route: hosted ? 'workers-ai' : 'ai-gateway',
    provider,
    name: hosted ? model.split('/').at(-1) : data.name,
    description: data.description.trim(),
    task,
    // Preserve the catalog's route metadata verbatim; never invent vendor aliases.
    providers: data.providers ?? null,
    provider_details: data.provider_details ?? null,
    request_formats: data.request_formats ?? null,
    planned_deprecation_date: hosted
      ? (data.properties ?? []).find(p => p.property_id === 'planned_deprecation_date')?.value ?? null
      : data.metadata?.planned_deprecation_date ?? null,
    documentation: `https://developers.cloudflare.com/ai/models/${model}/`,
    source: path
  };
}
export function validate(models, previous = []) {
  assert(Array.isArray(models) && models.length > 0, 'Empty catalog');
  const ids = new Set();
  for (const m of models) {
    assert(['workers-ai', 'ai-gateway'].includes(m.route), 'Invalid route');
    assert.equal(m.id, `${m.route}:${m.model}`);
    for (const key of ['model', 'provider', 'name', 'description', 'task', 'source', 'documentation'])
      assert.equal(typeof m[key], 'string', `Invalid ${key}: ${m.id}`);
    assert(!ids.has(m.id), `Duplicate route/model: ${m.id}`);
    ids.add(m.id);
  }
  assert.deepEqual(models.map(m => m.id), models.map(m => m.id).sort(compare), 'Unsorted catalog');
  for (const route of ['workers-ai', 'ai-gateway']) {
    const current = models.filter(m => m.route === route);
    assert(current.length >= (route === 'workers-ai' ? 50 : 100), `Suspicious ${route} count`);
    // A complete source revision may legitimately retire models. Block large
    // removals within each route even when additions mask the net count change.
    const currentIds = new Set(current.map(m => m.id));
    const removed = previous.filter(m => m.route === route && !currentIds.has(m.id));
    const previousCount = previous.filter(m => m.route === route).length;
    assert(removed.length <= previousCount * 0.1, `Review required for removals exceeding 10% of ${route}: ${removed.map(m => m.id).join(', ')}`);
  }
  for (const provider of ['openai', 'anthropic', 'google'])
    assert(models.some(m => m.route === 'ai-gateway' && m.provider === provider), `Missing ${provider}`);
}
