import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
export function createCore(blueprint,modules){
 const add=(p,g,m,pos=[0,0,0],rot=[0,0,0])=>{const o=new THREE.Mesh(g,m);o.position.fromArray(pos);o.rotation.set(...rot);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
 const geo={
 box(p,size,pos,mat,options={}){const b=options.bevel||0;return add(p,b?new RoundedBoxGeometry(...size,1,b):new THREE.BoxGeometry(...size),mat,pos,options.rotation);},
 cylinder(p,{radiusTop=.1,radiusBottom=radiusTop,height=1,segments=8,position=[0,0,0],rotation=[0,0,0],material}){return add(p,new THREE.CylinderGeometry(radiusTop,radiusBottom,height,segments),material,position,rotation);},
 mesh(p,{positions,indices,material,flat=true}){let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));if(indices)g.setIndex(indices);if(flat&&g.index)g=g.toNonIndexed();g.computeVertexNormals();return add(p,g,material);},
 group(id){const b=blueprint.modules.find(m=>m.id===id);if(!b)throw Error('Unknown module '+id);const g=new THREE.Group();g.name=id;g.position.fromArray(b.position);g.rotation.set(...b.rotation);modules.set(id,g);return g;},
 };
 const text={make(label,{width=2048,height=256,font='bold 120px Georgia',color='#244843',background='#FFF0C9'}={}){const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d');x.fillStyle=background;x.fillRect(0,0,width,height);x.font=font;x.textAlign='center';x.textBaseline='middle';x.fillStyle=color;x.fillText(label,width/2,height/2,width*.94);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;},plane(p,{label,size,position=[0,0,0],rotation=[0,0,0],...opts}){const m=new THREE.MeshStandardMaterial({map:text.make(label,opts),roughness:.9});return add(p,new THREE.PlaneGeometry(...size),m,position,rotation);}};
 return {geo,text,registerModule:(id,g)=>modules.set(id,g)};
}
export function batchStatic(root,protectedObjects=[]){
 root.updateMatrixWorld(true);const protect=new Set();for(const ob of protectedObjects.filter(Boolean)){ob.traverse(o=>protect.add(o));for(let p=ob.parent;p;p=p.parent)protect.add(p);}
 for(const group of root.children){const batches=new Map();group.updateWorldMatrix(true,true);const inverse=group.matrixWorld.clone().invert();group.traverse(o=>{if(!o.isMesh||protect.has(o)||Array.isArray(o.material))return;const key=o.material.uuid;if(!batches.has(key))batches.set(key,{material:o.material,items:[]});batches.get(key).items.push(o);});for(const b of batches.values()){if(b.items.length<2)continue;const geos=b.items.map(o=>{let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(inverse.clone().multiply(o.matrixWorld));if(!g.getAttribute('uv'))g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.getAttribute('position').count*2),2));return g;});const merged=mergeGeometries(geos,false);if(!merged)continue;const mesh=new THREE.Mesh(merged,b.material);mesh.castShadow=true;mesh.receiveShadow=true;mesh.name=group.name+'-batch';group.add(mesh);b.items.forEach(o=>o.removeFromParent());geos.forEach(g=>g.dispose());}}
}
