import * as THREE from 'three';
export function createMaterials(blueprint){return Object.fromEntries(Object.entries(blueprint.materials).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:.88,metalness:k==='brass'?.25:0,flatShading:true})]));}
