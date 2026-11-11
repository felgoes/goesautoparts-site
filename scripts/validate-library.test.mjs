import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateEntry } from './validate-library.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const draft = JSON.parse(
  await readFile(path.join(root, 'src/content/library/tiggo-5x-txs-2021.json'), 'utf8'),
);

test('aceita fixture draft de QA e preserva zeros à esquerda no código textual', async () => {
  const fixture = structuredClone(draft);
  fixture.parts[0].reference.code = '000123';
  assert.deepEqual(await validateEntry(fixture), []);
  assert.equal(fixture.parts[0].reference.code, '000123');
});

test('recusa fixture published incompleta de QA', async () => {
  const fixture = structuredClone(draft);
  fixture.publicationStatus = 'published';
  const errors = await validateEntry(fixture);
  assert.ok(errors.some((error) => error.includes('configuração aprovada')));
  assert.ok(errors.some((error) => error.includes('capa aprovada')));
  assert.ok(errors.some((error) => error.includes('fotos aprovadas')));
});

test('gerador exclui conteúdo draft da saída pública', async () => {
  execFileSync(process.execPath, ['scripts/validate-library.mjs'], { cwd: root });
  const generated = await readFile(
    path.join(root, 'src/library/generated/library.generated.ts'),
    'utf8',
  );
  assert.match(generated, /libraryCards: LibraryCard\[\] = \[\]/);
  assert.doesNotMatch(generated, /F01R00A092|F01R00A092-GEN/);
});
