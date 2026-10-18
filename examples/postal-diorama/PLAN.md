# Juniper 邮电局执行计划

Run: postal-example。工程根：examples/postal-diorama。Architect已实际查看概念图。SPEC是需求权威，BLUEPRINT是空间约束；概念图采用体块与配色，简化密集砖缝和瓦片。

## 锁定空间与外观

12×9m平底切角底座，承载面Y=.51；主楼位于(-.65,-.6)，正面+Z。主屋顶锁定简单四坡hip roof，前面低矮钟山墙；右侧翼锁定单坡屋顶。主屋顶最高6.49m、钟帽最高6.95m。入口平台Y=.96，三阶各高.15、深.30m，门底同高。后左分面树不超过4.81m。右后双杆与线缆不穿前招牌。四坡顶用四个大面、少量脊段和宽色带，不做密集瓦。长椅取代独立路灯；入口可有两盏小壁灯。

蓝图position是模块包络中心，dimensions是局部轴向包络；rotation以弧度XYZ表示，世界bounds由变换角点计算。每个模块group应用蓝图transform，内部使用局部坐标。实际geometry不得悄悄越界；需变更时Lead记录并重跑Box3/接触检查。allowedOverlap只是装配意图。阴影接收面可在plinth底下Y=-.025设置不显轮廓的shadow-only平面，不增加可见地形。

## 技术与本地交付

采用Node22/npm10、Vite + Three.js、原生JavaScript ES modules；npm本地依赖three、vite、playwright（使用已安装Chromium或系统Edge）。不使用React、CDN或远程字体。所有源码、依赖、生成资源和dist留在工程。CanvasTexture用本机Georgia/serif并等待document.fonts.ready。必要浏览器下载也放工程目录。
package scripts：dev、build、preview、test:integration、capture。dev/preview监听127.0.0.1。
start.bat先cd自身目录，检查node/npm，仅node_modules缺失时npm install，再npm run dev -- --host 127.0.0.1；打印本地URL，不终止用户其他服务。README.md用简洁中文说明双击启动、Node要求、操作、检查命令、截图/画廊路径、真实限制。交付dist、progress.html及证据；画廊相对路径，不复制node_modules到gallery或截图目录。

## 文件归属与委派

Lead先写好并冻结共享helper/material接口，再启动隔离Specialist。推荐两位：Building和Streetscape；总槽位root+Lead+两位Specialist。必须真实委派至少一位。若只用一位，Building交Specialist，Lead独自拥有Streetscape。不同Agent不可同时写同一文件。

| 归属 | 可写文件 | 内容 |
|---|---|---|
| Lead | package.json/package-lock.json,index.html,src/main.js,src/style.css,src/core.js,src/materials.js,src/runtime.js,tuning_params.json,scripts/*,start.bat,README.md,dist/* | 依赖、renderer/controls/light、共享接口、UI/交互、截图测试及集成 |
| Building Specialist | src/modules/building.js | main_shell/main_roof/clock_dormer/front_facade/wing_shell/wing_roof/porch_platform/stairs/porch_columns/porch_canopy、文字与信号灯 |
| Streetscape Specialist | src/modules/streetscape.js | plinth/paving/mailbox/cart/parcels/bench/landscape/pole_front/pole_back/wires、信封与挡板引用 |
| 后续Art_Director | tuning_params.json、候选配置/截图、progress.html | 只改已有参数 |
| 后续Shader_Material | 交接指定材质/几何文件 | 通过版备份后最多两轮 |
| 全新Critic | 只读 | root保存原始报告 |

Lead只有在Specialist完成并明确接管后才能编辑该模块。共享接口变更先暂停依赖写入并广播版本，不能让Agent猜测。

## 先发布共享接口 v1

export function buildBuilding(ctx) / buildStreetscape(ctx)。
ctx={THREE,blueprint,materials,geo,text,registerModule}；返回{group:THREE.Group,refs,contacts}。顶层group在世界原点，子模块group使用蓝图transform，name等于唯一module id。模块不创建renderer、controls、lights、DOM、事件或动画循环。
materials为共享MeshStandardMaterial字典，键对应BLUEPRINT.materials；telegraphLamp使用独占材质，不修改复用glassWarm。默认roughness=.85/metalness=0，黄铜可.2–.35。控制颜色与roughness的材质由统一管理器登记。

Lead在src/core.js发布并冻结：
- geo.box(parent,sizeXYZ,positionXYZ,material,options={rotation:[0,0,0],bevel:0}) -> Mesh，geometry中心为原点，参数均parent局部坐标。
- geo.cylinder(parent,{radiusTop,radiusBottom,height,segments,position,rotation,material}) -> Mesh，默认轴Y。
- geo.mesh(parent,{positions,indices,material,flat:true}) -> Mesh，用于hip/shed顶、切角底座。
- geo.group(id) -> 已应用蓝图transform的Group；registerModule(id,group)登记真实Box3。
- text.make(label,{width,height,font,color,background}) -> CanvasTexture；text.plane(parent,{label,size:[w,h],position,font,...}) -> Mesh，文字默认正对+Z。
可采用等价API，但Lead须写真实签名和使用例，然后将同一版本交给两位Specialist。

Building refs={telegraphHit:Object3D,telegraphLamp:Mesh}。
Streetscape refs={mailboxHit:Object3D,mailFlap:Object3D|null,envelope:Mesh,mailPath:{start:Vector3,end:Vector3}}；信封初始隐藏，start在投口前方+Z约.65m，end略进投口。动画由Lead统一控制：投递1.35秒，信号固定短长节奏1.5秒，期间去重，结束恢复初态。
contacts=[{name,moduleId,object:Object3D,localPoint:[x,y,z],expectedY:number,tolerance:.03}]。轮底、车脚、邮筒、包裹、柱脚均提供；用localToWorld后对比。堆叠包裹支持面是下包顶，不统一吸地。stairs/platform/door另外提供顶/底世界坐标。
共享geometry/material释放时按Set去重。所有重复tile/frame/rafter/insulator采用实例或按材质合并；mail flap、信封、signal lamp保持可寻址。禁止为达到draw budget隐藏身份关键细节。

## 执行顺序

1. Lead读SPEC/BLUEPRINT/PLAN/contract，安装依赖并冻结共享接口，发布两份最小任务包（仅相关模块、接口、风格、归属），再委派。
2. Lead同步实现runtime、参数、灯/相机、中文小UI。默认参考蓝图机位，投影确认完整底座边距≥5%，顶端7–12%；portrait扩展垂直视锥保持水平宽度。
3. 集成模块，测actual Box3和contact points，检查招牌、树、线缆遮挡与台阶连续；在closeup/lowangle实际看接触。
4. build、集成检查、预算/性能实测，捕获pass_1。root冻结版本并独立Critic；有缺陷交回Lead，改后新captureId、新指纹、新Critic，几何最多5轮。
5. 后续Art_Director 2–3组参数并独立复核，Shader_Material最多2轮。视觉变更不得沿用旧分数。通过版备份仅保存明确源码/参数，不复制全部依赖。

## 参数、接口与就绪

tuning_params.json集中默认值及合法范围（或同源schema）：exposure .6–1.6；backgroundColor；key.color/intensity .1–6/position；ambient或hemisphere .05–3；shadow.enabled/bias/normalBias/radius/mapSize 512/1024/2048；各材质color/roughness .5–1/metalness 0–.5；各相机position/lookAt/frustum或fov20–65。sRGB output + ACESFilmic tone mapping，默认exposure约1；PCFSoftShadowMap；默认主光(-7,12,8)，淡暖主光、中性填光。真实校准，不塑料高光。
applyTuningParams校验、部分合并、真实更新灯/材质/投影/controls，完成渲染才resolve；拒绝NaN/非法值。未采用composer则直接render，不能声称用了未实现后处理。

必须暴露：
- window.sceneReady Promise：字体、必要纹理、shader compile、首个完成帧后resolve；必要错误reject。
- window.setCameraMode(mode)：overview/closeup/lowangle/wireframe，实际帧后resolve；未知模式抛错。wireframe复用overview，兼容Material[]和共享材质去重，退出恢复原值。
- window.applyTuningParams(params)：上述真实应用及校验。
- window.setCaptureState({frozen,time})：time秒，冻结自运行时间；time0重置信封/信号初态，动画可按绝对时间确定求值，截图后恢复互动。
- window.getSceneDiagnostics()：mode、相机投影/position/target/near/far/fov/frustum、viewport/DPR、seed/time、actual模块Box3、contact误差、资源/renderer.info统计及口径、互动状态、WebGL renderer。
- window.triggerMail()/triggerTelegraph()/resetScene()：UI和Raycaster调用同一通路。reset中断并恢复overview和互动初态。
clean=1隐藏全部HTML UI与debug helpers，不隐藏建筑文字。默认seed731042、动画time0；不能靠固定sleep假装资源就绪。

## 指纹、捕获与必要实测

scripts/fingerprint.mjs按路径排序对文件名+内容做SHA256：index.html、src/**、public/**若有、package.json、package-lock.json、构建配置、BLUEPRINT.json及实际运行资产。tuning_params.json另算。排除node_modules、dist、artifacts、progress.html、README、state等变化证据。manifest保存文件清单/每文件摘要；捕获前后指纹必须一致。运行dist前先build并记录其对应源码指纹，防旧dist。脚本自身另记tool fingerprint。

scripts/capture_views.mjs命令：
node scripts/capture_views.mjs --run-id postal-example --capture-id pass_1 --url http://127.0.0.1:5173/
run/capture只允许安全单目录名，拒绝..、路径分隔符、绝对路径；已存在capture目录拒绝覆盖。显式URL复用服务；若自动启动仅finally关闭本次拥有的服务/browser。可用Playwright chromium或channel:'msedge'。视口1440×1000，DPR1，clean=1合并query，记录真实URL/browser/WebGL。有限导航/ready超时，await sceneReady/reset/freeze time0/setCameraMode，然后截图全屏canvas。不用任意sleep代替就绪。
输出artifacts/<runId>/<captureId>/{overview,closeup,lowangle,wireframe}.png和manifest.json。校验PNG可解码、尺寸、像素方差非空；各模式hash不同；overview/wireframe机位同，其余不同。监听pageerror、requestfailed、必要资源非2xx、contextlost，失败非零，保留diagnostics但不写成功manifest。
最后才写manifest：run/capture/time/URL、viewport/DPR、seed/time、source与params指纹、每图path/hash/camera、错误清单、checks引用。

scripts/integration_test.mjs输出实际checks.json：
1. build成功、加载无异常/必要资源失败/context loss、sceneReady真实耗时。
2. 所有视图切换；共享材质与Material[]线框恢复；非法mode/参数拒绝；有效曝光/颜色变化用真实状态和像素差验证，再恢复默认。
3. UI与至少一次真实Raycaster拾取投信，时间推进检查位置变化、进行中去重、结束隐藏、第二次可用；电报检查发光实际变化与复位；reset中断恢复。
4. 拖动确实改camera，滚轮改zoom，限制不穿地；390×844无横向UI溢出、按钮可点、全底座入镜。
5. contacts误差≤.03，阶梯/平台连续、门底=平台顶；实际模块Box3与允许装配比对。AABB只粗筛，结合可见接触和实际mesh，不能据蓝图手写bounds宣称无穿模。
6. 正常overview triangles≤100000、drawCalls≤350，明确renderer.info/reset/阴影计数口径；纹理≤8，最长边≤2048；自有静态资产≤10MiB（不计npm、概念图、截图）。
7. 连续10秒requestAnimationFrame实测中位/P95、样本数、WebGL renderer/GPU、viewport/DPR，记录是否软件渲染。如性能目标未达如实写限制，不冒充桌面60fps。几何/材质变更需重新测预算。
每轮只重跑受影响检查，最终版本保持证据一致。交付可启动工程、dist、四视图、gallery、真实检查及独立评审；门槛依execution-contract，未通过不可写已通过。

