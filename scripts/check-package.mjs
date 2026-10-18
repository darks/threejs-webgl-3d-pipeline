import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
const required = ['LICENSE','THIRD_PARTY_NOTICES.md','licenses/threejs.txt','README.md','docs/installation.md','docs/usage.md','docs/testing.md','skills/threejs-webgl-3d-pipeline/SKILL.md','skills/threejs-webgl-3d-pipeline/references/execution-contract.md','examples/postal-diorama/index.html','examples/store.html','examples/london-eye.html'];
required.forEach(p => assert.ok(fs.statSync(p).size > 0, p));
const postal=fs.readFileSync('examples/postal.html','utf8');
assert.ok(!/<script\b[^>]*\bsrc=/i.test(postal),'Postal has an external script');
assert.ok(!/<link\b[^>]*\brel="stylesheet"/i.test(postal),'Postal has an external stylesheet');
assert.match(postal,/Permission is hereby granted/);
const skill = fs.readFileSync(required[7], 'utf8');
assert.match(skill, /^---\r?\nname: threejs-webgl-3d-pipeline\r?\ndescription: .+\r?\n---/);
for (const entry of JSON.parse(fs.readFileSync('examples/provenance.json','utf8'))) {
  const data = fs.readFileSync('examples/' + entry.file);
  assert.equal(createHash('sha256').update(data).digest('hex'), entry.distributedSha256, entry.file);
  assert.match(data.toString(), /Permission is hereby granted/);
  assert.ok(!/<(?:script|img|link)\b[^>]*(?:src|href)=["']https?:/i.test(data.toString()), 'Unexpected remote resource');
}
const documents = ['README.md','CONTRIBUTING.md','THIRD_PARTY_NOTICES.md','docs/installation.md','docs/usage.md','docs/testing.md','examples/README.md'];
for (const doc of documents) {
  const text = fs.readFileSync(doc, 'utf8');
  for (const [,target] of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(https?:|#)/.test(target)) continue;
    assert.ok(fs.existsSync(path.resolve(path.dirname(doc), target.split('#')[0])), `${doc}: broken link ${target}`);
  }
}
// Verify actual installer behavior in an ignored local directory, including refusing overwrite.
const scratch = fs.mkdtempSync(path.join(fs.mkdirSync('artifacts',{recursive:true}) || 'artifacts', 'install-check-'));
const call = args => spawnSync(process.execPath,['scripts/install-skill.mjs','--target',scratch,...args],{encoding:'utf8'});
assert.equal(call(['--dry-run']).status,0);
assert.equal(fs.existsSync(path.join(scratch,'threejs-webgl-3d-pipeline')),false);
assert.equal(call([]).status,0);
assert.equal(fs.readFileSync(path.join(scratch,'threejs-webgl-3d-pipeline/SKILL.md'),'utf8'),skill);
const installedContract=path.join(scratch,'threejs-webgl-3d-pipeline/references/execution-contract.md');
assert.equal(fs.readFileSync(installedContract,'utf8'),fs.readFileSync(required[8],'utf8'));
assert.notEqual(call([]).status,0);
assert.equal(fs.readFileSync(installedContract,'utf8'),fs.readFileSync(required[8],'utf8'));
console.log('PASS package files, documentation links, standalone provenance/licenses, installer copy and overwrite refusal');
