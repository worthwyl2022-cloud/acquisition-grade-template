import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('required governance and security artifacts exist', () => {
  for (const file of ['README.md', 'SECURITY.md', 'LICENSE', 'PROPERTY_REGISTRY.md']) {
    assert.ok(fs.statSync(path.join(root, file)).size > 0, `${file} must be non-empty`);
  }
});

test('GitHub App middleware exposes the governed PR endpoint', () => {
  const source = fs.readFileSync(path.join(root, 'scripts/github-app/index.js'), 'utf8');
  assert.match(source, /\.post\(['"]\/create-pr['"],/);
  assert.match(source, /createOrUpdateFileContents/);
  assert.match(source, /pulls\.create/);
});
