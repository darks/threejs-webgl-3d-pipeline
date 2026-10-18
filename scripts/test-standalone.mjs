import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL,fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

process.chdir(fileURLToPath(new URL('../',import.meta.url)));
const out='artifacts/standalone';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--enable-unsafe-swiftshader']});
const results=[];
try{
  for(const file of ['postal.html','store.html','london-eye.html']){
    // Copy only this HTML to an otherwise empty directory, preventing hidden sibling dependencies.
    const isolated=fs.mkdtempSync(path.join(out,'isolated-'));const target=path.resolve(isolated,file);fs.copyFileSync('examples/'+file,target);
    const page=await browser.newPage({viewport:{width:1440,height:1000},offline:true});const errors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));
    page.on('request',r=>{if(r.url()!==pathToFileURL(target).href&&!r.url().startsWith('data:'))requests.push(r.url());});
    await page.goto(pathToFileURL(target).href);await page.waitForFunction(()=>!!window.sceneReady);await page.evaluate(()=>window.sceneReady);
    assert.equal(await page.locator('canvas').count(),1);
    if(file==='postal.html'){
      await page.locator('#mail').click();await page.waitForFunction(()=>window.getSceneDiagnostics().interaction.mailCount===1);
      await page.waitForFunction(()=>!window.getSceneDiagnostics().interaction.mailActive);
      await page.locator('#telegraph').click();await page.waitForFunction(()=>window.getSceneDiagnostics().interaction.telegraphCount===1);
      await page.locator('#reset').click();assert.equal(await page.evaluate(()=>window.getSceneDiagnostics().interaction.telegraphActive),false);
      for(const mode of ['closeup','lowangle','wireframe','overview'])await page.evaluate(m=>window.setCameraMode(m),mode);
      assert.equal(await page.evaluate(()=>window.getSceneDiagnostics().mode),'overview');
    }
    const screenshot=await page.screenshot({path:path.join(out,file+'.png')});const png=PNG.sync.read(screenshot);
    const colors=new Set();for(let i=0;i<png.data.length;i+=128)colors.add(png.data.subarray(i,i+3).toString('hex'));assert.ok(colors.size>20,'Blank render');
    assert.deepEqual(errors,[]);assert.deepEqual(requests,[],'Standalone page attempted to load another file or URL');
    results.push({file,status:'passed',offline:true,isolated:true,externalRequests:requests,errors});await page.close();
  }
}catch(e){results.push({status:'failed',error:e.stack});process.exitCode=1;console.error(e);}finally{await browser.close();fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));}
