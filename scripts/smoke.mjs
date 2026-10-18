import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
const update=process.argv.includes('--update-previews'),dev=process.argv.includes('--dev');
const port=Number(process.env.SMOKE_PORT||4178);assert.ok(Number.isInteger(port)&&port>1024&&port<65536);
if(!dev)assert.ok(fs.existsSync('dist/index.html'),'Run npm run build first');
fs.mkdirSync('artifacts/smoke',{recursive:true});fs.mkdirSync('docs/images',{recursive:true});
const url=`http://127.0.0.1:${port}`;
const service=spawn(process.execPath,['node_modules/vite/bin/vite.js',...(dev?[]:['preview']),'--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:['ignore','pipe','pipe'],windowsHide:true});
let serviceLog='',browser;service.stdout.on('data',x=>serviceLog+=x);service.stderr.on('data',x=>serviceLog+=x);
const results={status:'running',mode:dev?'development':'production-preview',tests:[]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const hash=data=>createHash('sha256').update(data).digest('hex');
function imageInfo(data){const png=PNG.sync.read(data);let sum=0,sq=0,n=0;for(let i=0;i<png.data.length;i+=16){const v=png.data[i];sum+=v;sq+=v*v;n++;}const variance=sq/n-(sum/n)**2;assert.ok(variance>10,'Blank screenshot');return{width:png.width,height:png.height,variance,sha256:hash(data)};}
const ready=async(page,href)=>{await page.goto(href,{waitUntil:'networkidle',timeout:30000});await page.waitForFunction(()=>!!window.sceneReady,{timeout:30000});await page.evaluate(()=>window.sceneReady);};
try{
  let started=false;
  for(let attempt=0;attempt<100;attempt++){
    if(service.exitCode!==null)throw Error('Preview failed: '+serviceLog);
    // Only trust this process's startup message; never reuse an unknown listener.
    if(serviceLog.includes('Local:')){started=true;break;}await sleep(100);
  }
  assert.ok(started,'Preview startup timeout: '+serviceLog);
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--enable-unsafe-swiftshader']});
  for(const [id,href] of [['postal','/examples/postal.html'],['store','/examples/store.html'],['london-eye','/examples/london-eye.html']]){
    const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});const errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()+' '+r.failure()?.errorText));page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP${r.status()} ${r.url()}`);});
    await ready(page,url+href);assert.equal(await page.locator('canvas').count(),1);
    const initial=await page.evaluate(()=>({postal:window.getSceneDiagnostics?.().interaction,night:document.body.classList.contains('night'),paused:window.getSceneDiagnostics?.().animation?.paused}));
    if(id==='postal'){
      await page.locator('#mail').click();await page.waitForFunction(()=>window.getSceneDiagnostics().interaction.mailCount===1);
      await page.waitForFunction(()=>!window.getSceneDiagnostics().interaction.mailActive);
      await page.locator('#telegraph').click();await page.waitForFunction(()=>window.getSceneDiagnostics().interaction.telegraphCount===1);
      await page.locator('#reset').click();assert.equal(await page.evaluate(()=>window.getSceneDiagnostics().interaction.telegraphActive),false);
    }else if(id==='store'){
      await page.locator('#theme-toggle').click();await page.waitForFunction(was=>document.body.classList.contains('night')!==was,initial.night);
      await page.locator('[data-dept="books"]').click();assert.equal(await page.locator('#detail-panel').isVisible(),true);
      await page.locator('#close-detail').click();assert.equal(await page.locator('#detail-panel').isVisible(),false);
      await page.locator('#theme-toggle').click();
    }else{
      await page.locator('#pause').click();assert.equal(await page.evaluate(()=>window.getSceneDiagnostics().animation.paused),!initial.paused);
      await page.locator('#pause').click();assert.equal(await page.evaluate(()=>window.getSceneDiagnostics().animation.paused),initial.paused);
      const t=await page.evaluate(()=>window.getSceneDiagnostics().animation.seconds);
      await page.waitForFunction(t=>window.getSceneDiagnostics().animation.seconds>t,t);
    }
    await ready(page,url+href+'?clean=1');
    await page.evaluate(async()=>{if(window.setCaptureState)await window.setCaptureState({frozen:true,time:0});if(window.setAnimationPaused){await window.setAnimationPaused(true);await window.setAnimationTime(0);}if(window.sceneCapture)await window.sceneCapture.freeze();});
    const views=[];
    for(const mode of ['overview','closeup','lowangle','wireframe']){
      await page.evaluate(mode=>window.setCameraMode(mode),mode);
      const buffer=await page.screenshot({path:`artifacts/smoke/${id}-${mode}.png`});views.push({mode,...imageInfo(buffer)});
      if(update&&mode==='overview')fs.writeFileSync(`docs/images/${id}.png`,buffer);
    }
    assert.equal(new Set(views.map(x=>x.sha256)).size,4,`${id}: view switching did not change the image`);
    await page.setViewportSize({width:390,height:844});await ready(page,url+href);
    assert.ok(await page.evaluate(()=>document.querySelector('canvas').width>0));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,`${id}: horizontal overflow`);
    imageInfo(await page.screenshot({path:`artifacts/smoke/${id}-mobile.png`}));
    assert.deepEqual(errors,[],id);results.tests.push({id,status:'passed',views,interaction:'passed',mobile:'passed',errors});await page.close();
  }
  const gallery=await browser.newPage({viewport:{width:1440,height:1000}});await gallery.goto(url,{waitUntil:'networkidle'});
  assert.equal(await gallery.locator('.card').count(),3);await gallery.waitForFunction(()=>Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0));
  await gallery.screenshot({path:'artifacts/smoke/gallery.png'});await gallery.close();results.tests.push({id:'gallery',status:'passed',cards:3});results.status='passed';
}catch(e){results.status='failed';results.error=e.stack;process.exitCode=1;console.error(e);}finally{
  await browser?.close();service.kill();fs.writeFileSync('artifacts/smoke/checks.json',JSON.stringify(results,null,2));
  fs.writeFileSync('artifacts/smoke/server.log',serviceLog);console.log(JSON.stringify({status:results.status,tests:results.tests.map(t=>({id:t.id,status:t.status})),report:'artifacts/smoke/checks.json'}));
}
