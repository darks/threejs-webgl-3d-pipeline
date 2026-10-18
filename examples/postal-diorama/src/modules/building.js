// Building specialist — frozen shared API v1. All geometry is module-local.
export function buildBuilding(ctx) {
  const { THREE, materials: m, geo, text } = ctx;
  const group = new THREE.Group(); group.name = 'Juniper architecture';
  const refs = {}, contacts = [];
  const module = id => { const g = geo.group(id); group.add(g); return g; };
  const box = (g, s, p, mat, bevel = 0) => geo.box(g, s, p, mat, { bevel });
  const cyl = (g, r, h, p, mat, rot = [0,0,0], n = 12) => geo.cylinder(g, { radiusTop:r, radiusBottom:r, height:h, segments:n, position:p, material:mat, rotation:rot });
  const quad = (g, points, mat) => geo.mesh(g, { positions:points.flat(), indices:[0,1,2,0,2,3], material:mat });
  const beam = (g,a,b,width,depth,mat) => { const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b); const o=box(g,[width,av.distanceTo(bv),depth],av.clone().add(bv).multiplyScalar(.5).toArray(),mat); o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize()); return o; };
  // A closed four-corner slab whose top follows an arbitrary plane.
  const slab = (g, top, thickness, mat, edgeMat=m.roofDark) => {
    quad(g,top,mat);
    const bot=top.map(p=>[p[0],p[1]-thickness,p[2]]);
    quad(g,[bot[3],bot[2],bot[1],bot[0]],edgeMat);
    for(let i=0;i<4;i++){const j=(i+1)%4;quad(g,[top[j],top[i],bot[i],bot[j]],edgeMat);}
  };
  // Local facade frame, facing +Z; allows use on all four elevations.
  const window = (parent, {x=0,y=0,z=0,w=1,h=1.2,rotation=0,warm=false}) => {
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotation;parent.add(g);
    box(g,[w+.18,h+.19,.08],[0,0,.025],m.base,.018);
    box(g,[w,h,.035],[0,0,.076],m.roofDark);
    box(g,[w-.15,h-.15,.025],[0,0,.102],warm?m.glassWarm:m.glass);
    // Deliberately sparse colored panes read as interior warmth, not transparency.
    if(warm){box(g,[(w-.23)*.47,(h-.23)*.42,.012],[-w*.21,h*.20,.122],m.glass);box(g,[(w-.23)*.47,(h-.23)*.42,.012],[w*.21,-h*.20,.122],m.glass);}
    else {box(g,[w*.18,h*.55,.012],[-w*.25,h*.08,.122],m.roofLight);}
    for(const sx of [-1,1])box(g,[.075,h,.07],[sx*(w-.075)/2,0,.115],m.roofDark,.009);
    for(const sy of [-1,1])box(g,[w,.075,.07],[0,sy*(h-.075)/2,.115],m.roofDark,.009);
    box(g,[.055,h-.10,.065],[0,0,.126],m.trim);
    box(g,[w-.10,.052,.065],[0,.04,.128],m.trim);
    box(g,[w+.27,.105,.22],[0,-h/2-.095,.08],m.trim,.018);
    box(g,[w+.25,.09,.15],[0,h/2+.07,.055],m.trim,.015);
    for(const sx of [-1,1])box(g,[.09,.13,.12],[sx*w*.36,-h/2-.20,.025],m.base,.01);
    return g;
  };

  const shell=module('main_shell');
  // Facade and rear/side relief sit inside the architectural envelope.
  // The wall starts inside the foundation cap; its lower front no longer competes with the base front.
  box(shell,[6.14,4.195,4.17],[0,.1975,.065],m.wall,.045);
  box(shell,[6.4,.35,4.3],[0,-2.12,0],m.base,.04);
  box(shell,[6.36,.105,4.26],[0,-1.905,0],m.trim,.015);
  box(shell,[6.32,.13,4.22],[0,.215,0],m.trim,.018);
  box(shell,[6.4,.14,4.3],[0,2.225,0],m.trim,.018);
  // Alternating corner quoins supply large masonry rhythm without noisy bricks.
  for(const sx of [-1,1])for(const sz of [-1,1])for(let i=0;i<7;i++){
    const y=-1.63+i*.535;
    box(shell,[i%2?.30:.43,.23,.18],[sx*(3.20-(i%2?.15:.215)),y,sz*2.04],m.trim,.015);
    box(shell,[.18,.23,i%2?.43:.30],[sx*3.11,y,sz*(2.15-(i%2?.215:.15))],m.trim,.015);
  }
  // Visible right upstairs and left/rear windows stay within the shell Box3.
  for(const side of [-1,1])for(const zz of [-1.05,1.05]){
    window(shell,{x:side*3.010,y:1.555,z:zz,w:.84,h:1.04,rotation:side*Math.PI/2,warm:true});
    if(side<0)window(shell,{x:-3.010,y:-.70,z:zz,w:.84,h:1.20,rotation:-Math.PI/2,warm:false});
  }
  for(const xx of [-2,0,2])for(const yy of [-.65,1.555])window(shell,{x:xx,y:yy,z:-1.960,w:.86,h:yy>0?1.04:1.23,rotation:Math.PI,warm:xx===0});

  const roof=module('main_roof');
  const A=[-3.5,-.62,2.45],B=[3.5,-.62,2.45],C=[3.5,-.62,-2.45],D=[-3.5,-.62,-2.45],L=[-1.55,.66,0],R=[1.55,.66,0];
  quad(roof,[A,B,R,L],m.roof);
  quad(roof,[C,D,L,R],m.roofLight);
  geo.mesh(roof,{positions:[...B,...C,...R],indices:[0,1,2],material:m.roofLight});
  geo.mesh(roof,{positions:[...D,...A,...L],indices:[0,1,2],material:m.roofDark});
  box(roof,[7,.1,4.9],[0,-.67,0],m.roofDark,.012);
  box(roof,[6.91,.07,4.81],[0,-.685,0],m.trim);
  // Broad overlapping courses and hip caps articulate the actual sloping surfaces.
  for(const t of [.33,.66]){
    const y=-.62+1.28*t+.008,z=2.45*(1-t),x=3.5-1.95*t;
    const next=t+.025;
    const yn=-.62+1.28*next+.009,zn=2.45*(1-next),xn=3.5-1.95*next;
    quad(roof,[[-x,y,z],[x,y,z],[xn,yn,zn],[-xn,yn,zn]],m.roofLight);
    quad(roof,[[x,y,-z],[-x,y,-z],[-xn,yn,-zn],[xn,yn,-zn]],m.roof);
    quad(roof,[[x,y,z],[x,y,-z],[xn,yn,-zn],[xn,yn,zn]],m.roof);
    quad(roof,[[-x,y,-z],[-x,y,z],[-xn,yn,zn],[-xn,yn,-zn]],m.roofLight);
  }
  // Thin hip bars remain below the declared maximum; ridge is the absolute top.
  for(const [a,b] of [[A,L],[B,R],[C,R],[D,L]])beam(roof,a.map((v,i)=>i===1?v+.012:v*.985),b.map((v,i)=>i===1?v+.012:v),.075,.065,m.roofDark);
  for(let i=0;i<7;i++)box(roof,[.44,.105,.14],[-1.32+i*.44,.6675,0],m.roofDark,.015);
  for(const x of [-2.95,-2.25,-1.5,-.75,0,.75,1.5,2.25,2.95])for(const z of [-2.27,2.27])box(roof,[.14,.1,.26],[x,-.66,z],m.base,.01);

  const clock=module('clock_dormer');
  box(clock,[1.35,1.29,1.20],[0,-.395,-.02],m.wall,.025);
  box(clock,[1.52,.14,1.30],[0,-.97,0],m.trim,.018);
  // Gabled dormer body is a true extruded pentagon, not a painted false facade.
  const shape=new THREE.Shape();shape.moveTo(-.675,-.92);shape.lineTo(.675,-.92);shape.lineTo(.675,.24);shape.lineTo(0,.91);shape.lineTo(-.675,.24);shape.closePath();
  const body=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:1.14,bevelEnabled:false}),m.wall);body.position.z=-.61;body.castShadow=true;body.receiveShadow=true;clock.add(body);
  slab(clock,[[-.825,.26,.69],[0,1.04,.69],[0,1.04,-.69],[-.825,.26,-.69]],.07,m.roof);
  slab(clock,[[0,1.04,.69],[.825,.26,.69],[.825,.26,-.69],[0,1.04,-.69]],.07,m.roofLight);
  // Front roof edge uses inset cap beams so apex stays below 6.95.
  beam(clock,[-.78,.26,.64],[0,.995,.64],.07,.10,m.roofDark);
  beam(clock,[0,.995,.64],[.78,.26,.64],.07,.10,m.roofDark);
  cyl(clock,.49,.055,[0,-.25,.603],m.roofDark,[Math.PI/2,0,0],32);
  cyl(clock,.448,.045,[0,-.25,.647],m.brass,[Math.PI/2,0,0],32);
  cyl(clock,.423,.025,[0,-.25,.678],m.cream,[Math.PI/2,0,0],32);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const tick=box(clock,[i%3===0?.037:.021,i%3===0?.091:.059,.012],[Math.sin(a)*.357,-.25+Math.cos(a)*.357,.693],m.ink);tick.rotation.z=-a;}
  beam(clock,[0,-.25,.692],[-.235,-.055,.692],.035,.014,m.ink);
  beam(clock,[0,-.25,.692],[.155,-.068,.692],.045,.014,m.ink);
  cyl(clock,.043,.018,[0,-.25,.690],m.brass,[Math.PI/2,0,0],12);
  for(const sx of [-1,1])box(clock,[.11,1.15,.12],[sx*.62,-.37,.55],m.trim,.012);

  const facade=module('front_facade');
  for(const x of [-2,2])window(facade,{x,y:-.92,z:-.105,w:1,h:1.37,warm:true});
  for(const x of [-2,0,2])window(facade,{x,y:1.45,z:-.105,w:1.02,h:1.12,warm:x!==0});
  // Closed paneled entrance: bottom matches the top landing exactly.
  const door=box(facade,[1.15,1.97,.075],[0,-.965,-.0875],m.roofDark,.012);
  box(facade,[.93,.83,.035],[0,-.615,-.037],m.glass);
  for(const x of [-.25,.25])box(facade,[.37,.56,.035],[x,-1.48,-.025],m.roof,.018);
  box(facade,[.96,.075,.045],[0,-1.145,-.012],m.trim,.008);
  for(const x of [-.66,.66])box(facade,[.17,2.10,.18],[x,-.9,-.035],m.trim,.02);
  box(facade,[1.55,.16,.20],[0,.195,-.025],m.trim,.02);
  box(facade,[1.34,.06,.22],[0,-1.92,-.01],m.base,.01);
  cyl(facade,.046,.045,[.40,-1.11,.013],m.brass,[Math.PI/2,0,0]);
  box(facade,[.30,.075,.026],[0,-1.12,.02],m.brass,.006);
  // Small physical envelope emblem on the door glass.
  box(facade,[.30,.215,.018],[0,-.60,-.008],m.brass,.008);
  box(facade,[.266,.179,.018],[0,-.60,.003],m.roofDark);
  beam(facade,[-.132,-.512,.014],[0,-.622,.014],.014,.012,m.brass);
  beam(facade,[0,-.622,.014],[.132,-.512,.014],.014,.012,m.brass);
  // Dark frame, pale inset and raised corner fasteners keep lettering crisp.
  box(facade,[4.60,.47,.12],[0,.635,.06],m.roofDark,.025);
  box(facade,[4.44,.365,.025],[0,.635,.125],m.cream,.014);
  text.plane(facade,{label:'POST & TELEGRAPH',size:[4.31,.315],position:[0,.635,.139],width:2048,height:256,font:'bold 144px Georgia',color:'#244843',background:'#FFF0C9'});
  for(const x of [-2.22,2.22])cyl(facade,.023,.012,[x,.635,.128],m.brass,[Math.PI/2,0,0],8);
  // Wall lamps remain compact enough to fit the designated relief envelope.
  for(const x of [-.95,.95]){
    box(facade,[.13,.34,.055],[x,-.52,-.09],m.roofDark,.012);
    box(facade,[.18,.24,.12],[x,-.52,-.015],m.brass,.012);
    box(facade,[.13,.17,.014],[x,-.52,.052],m.glassWarm,.008);
    box(facade,[.23,.055,.17],[x,-.675,-.002],m.roofDark,.012);
    box(facade,[.23,.07,.17],[x,-.365,-.002],m.roofDark,.012);
  }

  const wing=module('wing_shell');
  box(wing,[2.06,2.44,2.74],[-.07,0,-.02],m.wall,.035);
  box(wing,[2.2,.34,3],[0,-1.05,0],m.base,.035);
  box(wing,[2.18,.10,2.98],[0,-.83,0],m.trim,.015);
  box(wing,[2.18,.12,2.98],[0,1.15,0],m.trim,.015);
  for(let i=0;i<4;i++)box(wing,[.28,.22,.13],[.94,-.56+i*.48,1.405],m.trim,.015);
  // Front plane intentionally recessed to contain all projected relief.
  const office=window(wing,{x:0,y:-.10,z:1.29,w:1.35,h:1.18,warm:true});
  box(wing,[1.58,.105,.24],[0,-.755,1.38],m.wood,.018);
  box(wing,[1.85,.39,.11],[0,.82,1.415],m.roofDark,.025);
  text.plane(wing,{label:'TELEGRAPH',size:[1.73,.30],position:[0,.82,1.476],width:1024,height:256,font:'bold 145px Georgia',color:'#244843',background:'#FFF0C9'});
  window(wing,{x:.910,y:-.13,z:-.35,w:.75,h:1.07,rotation:Math.PI/2,warm:true});
  window(wing,{x:0,y:-.13,z:-1.310,w:.90,h:1.07,rotation:Math.PI,warm:false});
  // Frame and window are hit-testable as a single physical object.
  refs.telegraphHit=office;
  box(wing,[.14,.40,.07],[.91,.24,1.35],m.roofDark,.012);
  box(wing,[.17,.27,.13],[.91,.24,1.405],m.brass,.012);
  const lampMat=m.glassWarm.clone();lampMat.emissive=new THREE.Color('#DC7435');lampMat.emissiveIntensity=.10;
  refs.telegraphLamp=box(wing,[.115,.20,.06],[.91,.24,1.465],lampMat,.015);
  for(const yy of [.075,.405])box(wing,[.22,.06,.19],[.91,yy,1.395],m.roofDark,.015);
  // Ceramic cable receiver on the outer wall, just below the roof.
  box(wing,[.10,.10,.20],[1.045,1.12,.10],m.roofDark);
  cyl(wing,.065,.14,[1.025,1.15,.10],m.ceramic,[0,0,Math.PI/2],10);

  const wr=module('wing_roof');
  // Solid sloping wall infill closes the high side of the shed roof.
  // It belongs to the roof envelope because the wing-shell envelope ends at 2.95m.
  const wyLeft=.20-.225*.5/2.65,wyRight=.20-2.425*.5/2.65;
  geo.mesh(wr,{positions:[-1.10,-.30,1.5,1.10,-.30,1.5,1.10,-.30,-1.5,-1.10,-.30,-1.5,-1.10,wyLeft,1.5,1.10,wyRight,1.5,1.10,wyRight,-1.5,-1.10,wyLeft,-1.5],indices:[4,5,6,4,6,7,0,2,1,0,3,2,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7],material:m.trim});
  slab(wr,[[-1.325,.30,1.70],[1.325,-.20,1.70],[1.325,-.20,-1.70],[-1.325,.30,-1.70]],.10,m.roof);
  for(const t of [.33,.66]){const x=-1.325+t*2.65,y=.30-t*.5+.007;quad(wr,[[x,y,1.69],[x+.045,y-.0085,1.69],[x+.045,y-.0085,-1.69],[x,y,-1.69]],m.roofLight);}
  for(const z of [-1.58,1.58])beam(wr,[-1.28,.255,z],[1.28,-.228,z],.055,.11,m.roofDark);
  for(const z of [-1.25,-.6,.05,.7,1.35])box(wr,[.15,.07,.11],[1.18,-.25,z],m.trim,.008);

  const platform=module('porch_platform');
  // Body ends at the cap underside (.14 local); the cap alone owns the landing surface.
  const landing=box(platform,[4.37,.365,1.07],[0,-.0425,0],m.base,.025);
  const landingCap=box(platform,[4.4,.085,1.1],[0,.1825,0],m.stoneLight,.014);
  contacts.push({name:'landing ground',moduleId:'porch_platform',object:landing,localPoint:[0,-.1825,0],expectedY:.51,tolerance:.03});

  const stairs=module('stairs'), stepTops=[],stepCaps=[];
  for(let i=0;i<3;i++){
    const height=.15*(i+1),z=.30-i*.30;
    const bodyHeight=height-.035;
    const step=box(stairs,[2.23,bodyHeight,.28],[0,-.225+bodyHeight/2,z],m.stone,.012);
    stepCaps.push(box(stairs,[2.25,.035,.30],[0,-.225+height-.0175,z],m.stoneLight,.009));
    contacts.push({name:`step ${i+1} ground`,moduleId:'stairs',object:step,localPoint:[0,-bodyHeight/2,0],expectedY:.51,tolerance:.03});
  }
  const columns=module('porch_columns');
  for(const x of [-1.865,1.865]){
    const foot=box(columns,[.42,.30,.42],[x,-.865,0],m.base,.024);
    box(columns,[.42,.095,.42],[x,-.6675,0],m.trim,.018);
    box(columns,[.20,1.44,.20],[x,.10,0],m.roofDark,.015);
    box(columns,[.31,.095,.31],[x,.845,0],m.trim,.015);
    box(columns,[.40,.12,.40],[x,.955,0],m.roofDark,.018);
    // Small curved-looking stepped corbels remain within the column envelope.
    for(const sx of [-1,1]){box(columns,[.065,.22,.23],[x+sx*.13,.745,0],m.roofDark,.01);}
    contacts.push({name:`porch column ${x<0?'left':'right'}`,moduleId:'porch_columns',object:foot,localPoint:[0,-.15,0],expectedY:.96,tolerance:.03});
  }
  const canopy=module('porch_canopy');
  slab(canopy,[[-2.45,-.025,.75],[2.45,-.025,.75],[2.45,.175,-.75],[-2.45,.175,-.75]],.10,m.roof);
  box(canopy,[4.9,.07,.13],[0,-.10,.675],m.roofDark,.01);
  for(const x of [-2.2,-1.65,-1.1,-.55,0,.55,1.1,1.65,2.2])box(canopy,[.085,.05,.27],[x,-.15,.40],m.trim,.005);
  for(const t of [.36,.70]){const z=.75-t*1.5,y=-.025+t*.20+.005;quad(canopy,[[-2.43,y,z],[2.43,y,z],[2.43,y+.007,z-.05],[-2.43,y+.007,z-.05]],m.roofLight);}
  // Machine-readable dimensional evidence; actual contact objects are measured by runtime.
  group.updateMatrixWorld(true);
  // Report dimensions from actual cap and door geometry, rounded only to micrometres.
  const round=v=>Math.round(v*1e6)/1e6;
  const platformTopY=round(new THREE.Box3().setFromObject(landingCap).max.y);
  const doorBottomY=round(new THREE.Box3().setFromObject(door).min.y);
  stepTops.push(...stepCaps.map(cap=>round(new THREE.Box3().setFromObject(cap).max.y)));
  refs.architectureEvidence={doorBottomY,platformTopY,stepTops,stepDepth:.30,doorObject:door,platformObject:landingCap};
  return {group,refs,contacts,assembly:{stairTopYs:stepTops,platformTopY,doorBottomY,stairDepth:.30,measurement:'Actual cap/door Box3 transformed into world coordinates'}};
}
