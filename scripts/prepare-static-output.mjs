import { copyFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = path.join(root, 'dist/site/browser');
await access(path.join(browser, 'index.csr.html'));
await access(path.join(browser, 'config.js'));
await copyFile(path.join(browser, 'index.csr.html'), path.join(browser, 'index.html'));
console.log('Home CSR e config.js presentes em dist/site/browser.');
