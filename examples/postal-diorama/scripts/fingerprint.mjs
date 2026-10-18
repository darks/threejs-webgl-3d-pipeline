import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
export const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
export function fingerprint(){const files=[];const walk=p=>{if(!fs.existsSync(p))return;for(const f of fs.readdirSync(p).sort()){const q=path.posix.join(p,f);if(fs.statSync(q).isDirectory())walk(q);else files.push(q);}};walk('src');walk('public');for(const p of ['index.html','package.json','package-lock.json','BLUEPRINT.json','tuning_schema.json','vite.config.js'])if(fs.existsSync(p))files.push(p);files.sort();const entries=files.map(p=>({path:p,sha256:hash(fs.readFileSync(p))}));return{source:hash(entries.map(e=>e.path+'\0'+e.sha256).join('\n')),params:hash(fs.readFileSync('tuning_params.json')),files:entries};}

export function toolFingerprint(files){return hash(files.sort().map(p=>p+'\0'+hash(fs.readFileSync(p))).join('\n'));}
