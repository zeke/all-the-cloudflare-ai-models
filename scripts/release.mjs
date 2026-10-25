import {execFileSync} from 'node:child_process';
import {readFile, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
const url = `https://registry.npmjs.org/${pkg.name}/${pkg.version}`;
const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
if (response.status === 404) {
  execFileSync('npm', ['publish', '--access', 'public', '--provenance'], {stdio: 'inherit'});
} else {
  if (!response.ok) throw new Error(`Registry lookup failed: ${response.status}`);
  const directory = await mkdtemp(join(tmpdir(), 'cloudflare-models-release-'));
  try {
    // npm verifies registry integrity. Compare packaged files rather than gzip
    // bytes, which can differ across npm/zlib versions and source commits.
    execFileSync('npm', ['install', '--prefix', directory, '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', `${pkg.name}@${pkg.version}`], {stdio: 'inherit'});
    const [packed] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json'], {encoding: 'utf8'}));
    for (const {path} of packed.files) {
      const installed = await readFile(join(directory, 'node_modules', pkg.name, path));
      const local = await readFile(new URL('../' + path, import.meta.url));
      if (path === 'package.json') {
        const publishedPackage = JSON.parse(installed);
        const localPackage = JSON.parse(local);
        delete publishedPackage.gitHead;
        delete localPackage.gitHead;
        assert.deepEqual(publishedPackage, localPackage, 'Published package metadata differs; bump version');
      } else assert(installed.equals(local), `Published ${path} differs; review and bump version`);
    }
    console.log(`${pkg.name}@${pkg.version} already published with identical packaged files`);
  } finally { await rm(directory, {recursive: true, force: true}); }
}
const registry = await fetch(url, {signal: AbortSignal.timeout(30000)});
if (!registry.ok) throw new Error(`Post-publish verification failed: ${registry.status}`);
console.log(`Verified registry version ${pkg.version}`);
