import {isDeepStrictEqual} from 'node:util';
import {compare} from './catalog.mjs';

export function counts(models) {
  return {
    entries: models.length,
    workersAI: models.filter(m => m.route === 'workers-ai').length,
    aiGateway: models.filter(m => m.route === 'ai-gateway').length,
    modelIDs: new Set(models.map(m => m.model)).size
  };
}
export function diffCatalog(previous, current) {
  const before = new Map(previous.map(m => [m.id, m]));
  const after = new Map(current.map(m => [m.id, m]));
  const added = current.filter(m => !before.has(m.id)).sort((a, b) => compare(a.id, b.id));
  const removed = previous.filter(m => !after.has(m.id)).sort((a, b) => compare(a.id, b.id));
  const changed = current.flatMap(model => {
    const old = before.get(model.id);
    if (!old) return [];
    const fields = [...new Set([...Object.keys(old), ...Object.keys(model)])].sort(compare)
      .filter(field => !isDeepStrictEqual(old[field], model[field]))
      .map(field => ({field, before: old[field], after: model[field]}));
    return fields.length ? [{id: model.id, fields}] : [];
  }).sort((a, b) => compare(a.id, b.id));
  return {added, removed, changed, before: counts(previous), after: counts(current), hasChanges: Boolean(added.length || removed.length || changed.length)};
}
const inline = value => {
  const text = (JSON.stringify(value) ?? 'absent').replaceAll('`', '\\u0060').replaceAll('<', '&lt;');
  return '`' + (text.length > 500 ? text.slice(0, 500) + '… (see source diff)' : text) + '`';
};
const delta = (after, before) => `${after} (${after - before >= 0 ? '+' : ''}${after - before})`;
export const changelogHeader = '# Catalog changelog\n\nChanges to catalog entries and routes. Distinct Cloudflare model IDs are counted exactly; aliases and routes can refer to the same underlying model, so these are not counts of unique underlying models. No-change checks add no entry.\n';
export function appendChangelog(previousText, diff, {date, revision, previousRevision}) {
  if (!diff.hasChanges) return previousText;
  const source = previousRevision
    ? `[source diff](https://github.com/cloudflare/cloudflare-docs/compare/${previousRevision}...${revision})`
    : `[source](https://github.com/cloudflare/cloudflare-docs/tree/${revision})`;
  const lines = [
    `## ${date}: ${diff.added.length} added, ${diff.removed.length} removed, ${diff.changed.length} changed`,
    '', `Cloudflare ${source}.`, '',
    `Catalog entries: ${delta(diff.after.entries, diff.before.entries)}; Workers AI: ${delta(diff.after.workersAI, diff.before.workersAI)}; AI Gateway: ${delta(diff.after.aiGateway, diff.before.aiGateway)}.`,
    `Distinct Cloudflare model IDs: ${delta(diff.after.modelIDs, diff.before.modelIDs)}.`, ''
  ];
  for (const [title, models] of [['Added', diff.added], ['Removed', diff.removed]]) {
    if (!models.length) continue;
    lines.push(`### ${title}`, '', ...models.map(m => `- ${inline(m.id)} (${m.task}).`), '');
  }
  if (diff.changed.length) {
    lines.push('### Changed', '');
    for (const model of diff.changed) {
      lines.push(`- ${inline(model.id)}`);
      for (const field of model.fields) lines.push(`  - ${field.field}: ${inline(field.before)} → ${inline(field.after)}.`);
    }
    lines.push('');
  }
  const body = previousText.startsWith(changelogHeader) ? previousText.slice(changelogHeader.length) : previousText;
  return changelogHeader + '\n' + lines.join('\n') + body.replace(/^\n+/, '\n');
}
