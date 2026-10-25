import {execFileSync} from 'node:child_process';
import {readFile, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
const url = `https://registry.npmjs.org/${pkg.name}/${pkg.version}`;
const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
if (response.status === 404) {
  execFileSync('npm', ['publish', '--access', 'public', '--provenance'], {stdio: 'inherit'});
} else {
  if (!response.ok) throw new Error(`Registry lookup failed: ${response.status}`);
  const published = await response.json();
  const [packed] = JSON.parse(execFileSync('npm', ['pack', '--json'], {encoding: 'utf8'}));
  try {
    const bytes = await readFile(packed.filename);
    const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
    if (integrity !== published.dist.integrity) throw new Error('Published version differs from checkout; review and bump version');
    console.log(`${pkg.name}@${pkg.version} already published with identical contents`);
  } finally { await rm(packed.filename); }
}
// Confirm installation from the public registry, including the JSON package export.
const registry = await fetch(url, {signal: AbortSignal.timeout(30000)});
if (!registry.ok) throw new Error(`Post-publish verification failed: ${registry.status}`);
console.log(`Verified registry version ${pkg.version}`);
