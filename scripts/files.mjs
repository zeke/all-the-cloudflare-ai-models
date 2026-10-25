import * as fs from 'node:fs/promises';

// Stage all outputs before replacing any file. Restore originals if a reported
// write/rename error interrupts replacement. GitHub publishes the files together
// in one Git commit; an interrupted process cannot publish an incomplete commit.
export async function commitFiles(root, contents, io = fs) {
  const originals = new Map();
  const replaced = [];
  const files = Object.keys(contents);
  for (const file of files) {
    try { originals.set(file, await io.readFile(new URL(file, root))); }
    catch (error) { if (error.code !== 'ENOENT') throw error; originals.set(file, null); }
  }
  try {
    for (const file of files) await io.writeFile(new URL(file + '.tmp', root), contents[file]);
    for (const file of files) {
      await io.rename(new URL(file + '.tmp', root), new URL(file, root));
      replaced.push(file);
    }
  } catch (error) {
    const failures = [];
    for (const file of replaced.reverse()) {
      try {
        if (originals.get(file) === null) await io.rm(new URL(file, root), {force: true});
        else await io.writeFile(new URL(file, root), originals.get(file));
      } catch (failure) { failures.push(failure); }
    }
    if (failures.length) throw new AggregateError([error, ...failures], 'Snapshot replacement and rollback failed; inspect working tree');
    throw error;
  } finally {
    await Promise.all(files.map(file => io.rm(new URL(file + '.tmp', root), {force: true})));
  }
}
