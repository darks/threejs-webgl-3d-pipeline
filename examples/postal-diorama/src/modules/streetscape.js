// Streetscape v1. All dimensions are metres; module children use blueprint-local coordinates.
export function buildStreetscape(ctx) {
  const { THREE, geo, materials: m, blueprint } = ctx;
  const group = new THREE.Group();
  group.name = 'streetscape';
  const contacts = [];
  const module = id => { const g = geo.group(id); group.add(g); return g; };
  const box = (p, size, pos, mat, bevel = 0, rotation) => geo.box(p, size, pos, mat, { bevel, rotation });
  const cyl = (p, radius, height, pos, mat, segments = 10, bottom = radius, rotation) => geo.cylinder(p, {
    radiusTop: radius, radiusBottom: bottom, height, position: pos, material: mat, segments, rotation,
  });
  const mesh = (p, geometry, material, position = [0, 0, 0]) => {
    const o = new THREE.Mesh(geometry, material); o.position.fromArray(position);
    o.castShadow = true; o.receiveShadow = true; p.add(o); return o;
  };
  const contact = (name, moduleId, object, localPoint, expectedY = .51) =>
    contacts.push({ name, moduleId, object, localPoint, expectedY, tolerance: .03 });
  const rod = (p, a, b, radius, material, segments = 6) => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), d = end.clone().sub(start);
    const o = cyl(p, radius, d.length(), start.clone().add(end).multiplyScalar(.5).toArray(), material, segments);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return o;
  };
  const clipped = (w, d, c) => [[-w/2+c,-d/2],[w/2-c,-d/2],[w/2,-d/2+c],[w/2,d/2-c],
    [w/2-c,d/2],[-w/2+c,d/2],[-w/2,d/2-c],[-w/2,-d/2+c]];
  const slab = (p, polygon, low, high, material, holes = []) => {
    const shape = new THREE.Shape(polygon.map(([x,z]) => new THREE.Vector2(x,-z)));
    for (const poly of holes) shape.holes.push(new THREE.Path(poly.map(([x,z]) => new THREE.Vector2(x,-z))));
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: high-low, bevelEnabled: false, steps: 1, curveSegments: 1 });
    geometry.rotateX(-Math.PI/2); geometry.translate(0,low,0);
    return mesh(p, geometry, material);
  };

  // A heavy clipped plinth with a small inset at its lower edge, and a quiet continuous pavement.
  const plinth = module('plinth');
  slab(plinth, clipped(11.91,8.91,.35), -.25,-.16,m.base);
  slab(plinth, clipped(12,9,.35), -.16,.19,m.base);
  slab(plinth, clipped(12,9,.35), .19,.25,m.stone);
  // Wide perimeter blocks: sparse vertical joints communicate masonry without a dense tile texture.
  for (let x=-5.2; x<5.7; x+=1.3) {
    box(plinth,[.017,.27,.008],[x,-.005,4.496],m.stone);
    box(plinth,[.017,.27,.008],[x,-.005,-4.496],m.stone);
  }
  for (let z=-3.4; z<4; z+=1.3) {
    box(plinth,[.008,.27,.017],[5.996,-.005,z],m.stone);
    box(plinth,[.008,.27,.017],[-5.996,-.005,z],m.stone);
  }
  const paving = module('paving');
  const bedPolygon = [[-5.72,-3.38],[-3.91,-3.38],[-3.91,.08],[-5.72,.08]];
  slab(paving,clipped(11.8,8.8,.32),-.005,.003,m.stone,[bedPolygon]);
  // Front apron only: large subtly varied flagstones with 1.5 cm joints.
  for (let row=0;row<2;row++) for (let col=0;col<8;col++) {
    const x=-5.075+col*1.45, z=2.92+row*.95;
    const tile=box(paving,[1.435,.002,.935],[x,.004,z],(col+row*2)%5===0?m.stoneLight:m.stone);
    tile.name='broad-front-flagstone';
  }
  // Broad side strips keep the sides intentional when the model is orbited.
  for (let z=-3.65;z<2;z+=1.2) {
    box(paving,[.76,.002,1.185],[5.49,.004,z],m.stoneLight);
  }

  const mailbox = module('mailbox');
  const mailFoot=cyl(mailbox,.36,.16,[0,-.775,0],m.ink,10,.36);
  mailFoot.name='mailbox-ground-plinth'; contact('mailbox base','mailbox',mailFoot,[0,-.08,0]);
  cyl(mailbox,.335,.065,[0,-.6625,0],m.redDark);
  cyl(mailbox,.315,1.19,[0,-.035,0],m.red);
  cyl(mailbox,.338,.065,[0,.5925,0],m.redDark);
  cyl(mailbox,.37,.06,[0,.655,0],m.red);
  cyl(mailbox,.39,.08,[0,.725,0],m.redDark);
  cyl(mailbox,.31,.09,[0,.81,0],m.red,10,.39);
  // A real front escutcheon, dark opening and independently addressable top-hinged flap.
  box(mailbox,[.52,.19,.055],[0,.385,.325],m.redDark,.018);
  box(mailbox,[.46,.103,.018],[0,.385,.362],m.ink,.008);
  const mailFlap = new THREE.Group(); mailFlap.name='mail-slot-hinge'; mailFlap.position.set(0,.435,.379); mailbox.add(mailFlap);
  box(mailFlap,[.448,.082,.019],[0,-.041,0],m.red,.005);
  box(mailbox,[.48,.032,.07],[0,.482,.342],m.red,.007);
  // Raised envelope emblem; diagonal strokes are geometry, not a texture.
  box(mailbox,[.37,.285,.045],[0,-.075,.314],m.redDark,.015);
  box(mailbox,[.276,.178,.015],[0,-.075,.344],m.cream,.006);
  rod(mailbox,[-.131,.007,.355],[0,-.083,.355],.008,m.redDark,5);
  rod(mailbox,[0,-.083,.355],[.131,.007,.355],.008,m.redDark,5);
  rod(mailbox,[-.13,-.154,.355],[-.048,-.091,.355],.006,m.redDark,5);
  rod(mailbox,[.13,-.154,.355],[.048,-.091,.355],.006,m.redDark,5);
  box(mailbox,[.24,.11,.017],[0,-.365,.326],m.brass,.008);
  box(mailbox,[.13,.018,.009],[0,-.366,.339],m.ink);
  cyl(mailbox,.025,.012,[.19,-.365,.322],m.brass,8,.025,[Math.PI/2,0,0]);
  for (let i=0;i<10;i++) {
    const a=i*Math.PI/5;
    box(mailbox,[.025,.041,.016],[Math.sin(a)*.368,.72,Math.cos(a)*.368],m.red,0,[0,a,0]);
  }
  const mailPath = {start:new THREE.Vector3(-3.45,1.75,4.15),end:new THREE.Vector3(-3.45,1.75,3.38)};
  const envelope=box(group,[.365,.218,.014],mailPath.end.toArray(),m.cream,.005);
  envelope.name='delivery-envelope'; envelope.rotation.x=-1.22; envelope.visible=false;
  rod(envelope,[-.17,.097,.01],[0,-.02,.01],.005,m.strap,4);
  rod(envelope,[0,-.02,.01],[.17,.097,.01],.005,m.strap,4);
  box(envelope,[.044,.048,.005],[.133,.061,.013],m.red);

  function parcel(parent, size, pos, material, name, moduleId, supportY) {
    const g=new THREE.Group(); g.position.fromArray(pos); g.name=name; parent.add(g);
    const [w,h,d]=size;
    const body=box(g,size,[0,0,0],material,.018);
    box(g,[.032,h+.007,d+.007],[0,0,0],m.strap);
    box(g,[w+.007,h+.007,.032],[0,0,0],m.strap);
    box(g,[w*.32,.003,d*.27],[-w*.22,h/2+.006,d*.19],m.cream,.001);
    // Two short printed label strokes, deliberately quiet at the scene scale.
    for(let i=0;i<2;i++) box(g,[w*.18,.003,.007],[-w*.22,h/2+.008,d*.19+i*.023],m.strap);
    if(supportY!==undefined) contact(name+' bottom',moduleId,body,[0,-h/2,0],supportY);
    return g;
  }
  const cart=module('cart');
  const wheelY=-.295, wheelZ=.10, wheelRadius=.27;
  for(const side of [-1,1]) {
    const wheel = new THREE.Group(); wheel.position.set(side*.53,wheelY,wheelZ); wheel.rotation.y=Math.PI/2; cart.add(wheel);
    wheel.name=side<0?'left-spoked-wheel':'right-spoked-wheel';
    const rim=mesh(wheel,new THREE.TorusGeometry(.236,.034,4,10),m.woodDark);
    contact(wheel.name+' ground','cart',rim,[0,-wheelRadius,0]);
    mesh(wheel,new THREE.TorusGeometry(.231,.018,4,10),m.wood);
    cyl(wheel,.066,.13,[0,0,0],m.woodDark,8,.066,[Math.PI/2,0,0]);
    cyl(wheel,.028,.145,[0,0,0],m.brass,8,.028,[Math.PI/2,0,0]);
    for(let spoke=0;spoke<8;spoke++) {
      const a=spoke*Math.PI/4;
      rod(wheel,[Math.cos(a)*.04,Math.sin(a)*.04,0],[Math.cos(a)*.217,Math.sin(a)*.217,0],.017,m.wood,5);
    }
  }
  rod(cart,[-.59,wheelY,wheelZ],[.59,wheelY,wheelZ],.035,m.woodDark);
  for(const x of [-.32,.32]) box(cart,[.07,.14,.62],[x,-.19,0],m.woodDark,.008);
  for(const z of [-.24,0,.24]) box(cart,[.92,.075,.225],[0,-.0975,z],m.wood,.009);
  for(const x of [-.47,.47]) {
    box(cart,[.055,.19,.68],[x,.035,0],m.wood,.008);
    rod(cart,[x,-.17,-.15],[x,.26,-.59],.026,m.woodDark);
    rod(cart,[x,.26,-.59],[x,.32,-.59],.034,m.wood);
  }
  box(cart,[.98,.19,.045],[0,.035,.33],m.wood,.006);
  for(const x of [-.29,.29]) {
    const leg=box(cart,[.065,.405,.065],[x,-.3625,-.24],m.woodDark,.008);
    contact('cart support foot '+x,'cart',leg,[0,-.2025,0]);
  }
  parcel(cart,[.36,.27,.40],[-.205,.075,.01],m.parcel,'cart parcel one','cart',1.015);
  parcel(cart,[.36,.32,.42],[.205,.10,.01],m.parcelLight,'cart parcel two','cart',1.015);
  parcel(cart,[.32,.245,.32],[-.19,.3325,.01],m.parcelLight,'cart parcel three','cart',1.285);
  const parcels=module('parcels');
  parcel(parcels,[.77,.39,.77],[0,-.24,.015],m.parcel,'porch lower parcel','parcels',.51);
  parcel(parcels,[.59,.45,.59],[.015,.18,-.025],m.parcelLight,'porch upper parcel','parcels',.90);

  const bench=module('bench');
  for(const x of [-.59,.59]) for(const z of [-.225,.225]) {
    const foot=box(bench,[.095,.40,.095],[x,-.23,z],m.woodDark,.008);
    contact('bench foot '+x+','+z,'bench',foot,[0,-.20,0]);
  }
  for(const z of [-.21,0,.21]) box(bench,[1.55,.075,.185],[0,.0075,z],m.wood,.014);
  for(const x of [-.59,.59]) {
    box(bench,[.07,.76,.075],[x,-.02,-.256],m.woodDark,.008);
    box(bench,[.07,.075,.59],[x,-.06,0],m.woodDark,.008);
  }
  for(const y of [.20,.365]) box(bench,[1.55,.13,.065],[0,y,-.255],m.wood,.012);
  rod(bench,[-.59,-.26,.10],[.59,-.26,.10],.028,m.woodDark);

  const landscapeModule=module('landscape');
  const landscape=new THREE.Group();
  landscape.name='garden-layout';
  // Keep the layout's world coordinates stable when its revised blueprint envelope is recentered.
  landscape.position.set(-4.82-landscapeModule.position.x,2.66-landscapeModule.position.y,-1.65-landscapeModule.position.z);
  landscapeModule.add(landscape);
  slab(landscape,[[-.90,-1.73],[.90,-1.73],[.90,1.73],[-.90,1.73]],-2.15,-2.115,m.soil);
  const tree=new THREE.Group();tree.name='front-left-tree';tree.position.set(-.23,0,2.40);landscape.add(tree);
  const trunk=cyl(tree,.09,2.46,[0,-.92,-.25],m.wood,7,.17);
  contact('tree trunk','landscape',trunk,[0,-1.23,0]);
  rod(tree,[0,-.70,-.25],[-.34,.25,-.35],.075,m.wood,7);
  rod(tree,[0,-.41,-.25],[.36,.45,-.13],.067,m.wood,7);
  rod(tree,[0,-.19,-.25],[.02,.60,.22],.06,m.woodDark,6);
  const foliage=(position,scale,material,turn=0,target=landscape)=>{
    const geometry=new THREE.IcosahedronGeometry(1,1);geometry.rotateY(turn);
    const o=mesh(target,geometry,material,position);o.scale.fromArray(scale);return o;
  };
  foliage([-.23,.66,-.42],[.68,.88,.72],m.leaf,.2,tree);
  foliage([.22,.94,-.04],[.67,.90,.70],m.leafLight,.5,tree);
  foliage([-.05,1.48,-.40],[.67,.67,.71],m.leafLight,-.3,tree);
  foliage([-.12,.37,.24],[.65,.68,.64],m.leaf,.9,tree);
  for(const [x,z,s] of [[-.35,-1.30,.42],[.35,.92,.38],[-.34,1.29,.37]]) {
    foliage([x,-2.115+s*.70,z],[s,s*.70,s],m.leafDark,.3);
    foliage([x+.10,-2.115+s*.83,z-.06],[s*.74,s*.65,s*.79],m.leaf,.8);
  }
  // Only a few blades at the garden edge, with deliberate fixed placements.
  for(const [x,z] of [[-.72,1.55],[.66,-1.51],[.66,.50],[-.70,-.91]]) {
    for(let i=-1;i<=1;i++) {
      const a=i*.45;
      geo.mesh(landscape,{positions:[x-.025,-2.115,z, x+.025,-2.115,z, x+Math.sin(a)*.12,-1.87+Math.abs(i)*-.04,z-.04],material:m.leaf,flat:true});
    }
  }

  function pole(id) {
    const p=module(id), bp=blueprint.modules.find(b=>b.id===id), h=bp.dimensions[1], bottom=-h/2;
    const shaft=cyl(p,.080,h,[0,0,0],m.wood,10,.115);
    contact(id+' base',id,shaft,[0,bottom,0]);
    cyl(p,.135,.18,[0,bottom+.09,0],m.woodDark,10);
    const high=h/2-.38, low=high-.46;
    for(const y of [high,low]) {
      box(p,[.76,.115,.135],[0,y,0],m.woodDark,.012);
      for(const x of [-.275,.275]) {
        rod(p,[x,y+.05,0],[x,y+.265,0],.018,m.wire,6);
        cyl(p,.068,.075,[x,y+.118,0],m.ceramic,8,.068);
        cyl(p,.053,.075,[x,y+.183,0],m.ceramic,8,.053);
        cyl(p,.040,.045,[x,y+.238,0],m.ceramic,8,.051);
      }
      cyl(p,.025,.015,[0,y,.076],m.ceramic,8,.025,[Math.PI/2,0,0]);
    }
    rod(p,[-.30,high-.04,-.07],[0,high-.38,-.07],.020,m.wire);
    rod(p,[.30,high-.04,-.07],[0,high-.38,-.07],.020,m.wire);
    for(const y of [bottom+.57,bottom+1.16]) cyl(p,.119,.045,[0,y,0],m.wire,10);
    return p;
  }
  pole('pole_front');pole('pole_back');
  const wires=module('wires');
  function wire(a,b,sag) {
    const A=new THREE.Vector3(...a).sub(wires.position),B=new THREE.Vector3(...b).sub(wires.position);
    const C=A.clone().add(B).multiplyScalar(.5);C.y-=sag*2;
    const curve=new THREE.QuadraticBezierCurve3(A,C,B);
    return mesh(wires,new THREE.TubeGeometry(curve,16,.018,5,false),m.wire);
  }
  for(const dx of [-.25,.25]) wire([5.3+dx,5.60,-.65],[4.9+dx,6.10,-3.48],.28);
  // Route outside the eave (max x=4.975), then terminate visibly below it.
  // This is the existing lead-in, moved onto a short wall bracket, not a roof penetration.
  wire([5.025,5.14,-.65],[5.12,3.22,.65],.12);
  wire([5.12,3.22,.65],[5.12,2.65,.65],0);
  const local=p=>new THREE.Vector3(...p).sub(wires.position).toArray();
  box(wires,[.06,.26,.19],local([4.77,2.58,.65]),m.woodDark,.008);
  rod(wires,local([4.79,2.50,.65]),local([5.12,2.50,.65]),.026,m.wire,6);
  rod(wires,local([5.12,2.50,.65]),local([5.12,2.65,.65]),.026,m.wire,6);
  cyl(wires,.090,.15,local([5.045,2.65,.65]),m.ceramic,8,.090,[0,0,Math.PI/2]);
  cyl(wires,.065,.045,local([5.11,2.65,.65]),m.ceramic,8,.065,[0,0,Math.PI/2]);
  group.updateMatrixWorld(true);
  return {group,refs:{mailboxHit:mailbox,mailFlap,envelope,mailPath},contacts};
}
