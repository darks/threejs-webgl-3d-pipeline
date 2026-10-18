import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../skills/threejs-webgl-3d-pipeline/', import.meta.url));
let parent = path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'skills');
let dryRun = false;
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === '--dry-run') dryRun = true;
  else if (arg === '--target' && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) parent = path.resolve(process.argv[++i]);
  else if (arg === '--help') { console.log('node scripts/install-skill.mjs [--target <skills-parent-directory>] [--dry-run]'); process.exit(0); }
  else throw new Error(`Unknown or incomplete argument: ${arg}`);
}
const target = path.resolve(parent, 'threejs-webgl-3d-pipeline');
if (fs.existsSync(target)) throw new Error(`Already exists; no files changed. Back up or move the existing skill first: ${target}`);
if (!fs.existsSync(path.join(source, 'references/execution-contract.md'))) throw new Error('Incomplete source package');
console.log(`${dryRun ? 'Would install' : 'Installing'} ${source} → ${target}`);
if (!dryRun) {
  fs.mkdirSync(parent, { recursive: true });
  fs.mkdirSync(target); // Exclusive creation: never merge into an existing directory.
  fs.cpSync(source, target, { recursive: true, force: false, errorOnExist: true });
  console.log('Installed. Refresh the host skill list or start a new session.');
}
