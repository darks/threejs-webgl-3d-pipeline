# 执行与产物契约

这是目标工程需要实现或适配的接口，不表示配套执行器已经安装。读取路径、截图和评审约定后再构建；仅在使用外部 CLI 时读取最后一节。

## 路径与运行身份

- projectRoot 是用户目标工程的绝对路径，不从 shell 启动位置或技能位置猜测。
- 新任务使用唯一 runId，如时间戳加随机后缀。恢复必须指定已有 runId 并检查源码、配置及产物是否仍对应，不按“最新文件”猜测。
- 每次截图使用新 captureId，如 pass_1、tuning_2、refine_1，禁止覆盖已有评审使用的截图。
- state.json 记录每阶段 status、产物、检查命令和结果及失败原因。skipped/blocked 不等于 passed。
- 用内容指纹或等价版本记录关联源码、资产及参数；源码指纹排除不断新增的截图、画廊及状态文件。评审前确认 manifest 对应当前待验收版本。

## 多 Agent 交接与独立评审

多角色提示只改变关注点，不建立上下文隔离。每个阶段的执行会话从最小交接包启动；同一模块内的开发与修复可以延续会话，跨阶段重新交接，Critic 每轮必须新建。允许使用相同模型，不把多 Agent 表述为消除了模型共有偏差。

主控在 `RUN/handoffs/<taskId>.json` 记录：任务及阶段、projectRoot/runId、真实会话 ID、角色、输入路径与版本、用户相关原话及来源、约束与明确假设、可读/可写文件、输出位置、验收条件、预算和实际工具能力。启动前可先记录任务，获得会话 ID 后补齐；不得虚构 ID。子代理返回产物路径、检查结果、未决问题及简短结论，完整日志留在文件中，不灌回主会话。

| 执行者 | 最小输入 | 职责及写入边界 |
| --- | --- | --- |
| Producer | 原始需求、参考、工程约束；随后接收 Director 回答 | 独立质询并复核回答；由主控保存实际讨论记录 |
| Director | 同一需求与参考、Producer 问题 | 回答、SPEC、视觉方向；不得将内部假设包装成用户要求 |
| Architect | 锁定 SPEC、基准图、现有工程接口 | BLUEPRINT、PLAN；不继承讨论与试错全历史 |
| Lead_Dev / Specialist | SPEC、蓝图、计划；Specialist 仅接收相关模块和共享接口 | 在分配文件内实现/修复；Lead_Dev 集成，禁止并发写同一文件 |
| Art_Director | SPEC、通过版本截图、参数及接口 | 参数配置、候选截图与画廊；不改几何或交互源码 |
| Shader_Material | SPEC、通过版本、目标图及相关模块 | 指定材质/几何模块与相关参数；不自行验收 |
| Critic | 当前 SPEC、蓝图、基准、四视图、manifest、原始检查证据 | 只读评审并返回 JSON，不修复、不写 state、不宣布阶段通过 |

隔离要求：

1. 使用新上下文启动选项，不继承整个主控/实现者会话。若工具强制继承，改用支持隔离的会话方式；能力确实缺失时阻塞。主控负责传齐用户约束和必要仓库规则，不能以隔离为由丢失需求。
2. Critic 不接收实现者自评、预期分数、通过催促或完整开发日志。先保存对当前版本的独立观察，再提供历史缺陷的 ID、现象和验收方法核对回归；不提供历史分数或“已修好”的断言。旧问题必须逐项处置，不能只因新报告没提到就自动关闭。
3. 每轮先冻结待评源码、参数及证据，完成评审前暂停写入；Critic 可以读取相关源码核查，缺证据则请求补充或报告无法验收，不凭解释补分。主控保存原始响应与会话来源，JSON 格式转换不得改变实质结论。
4. 只读指令属于行为约束，不自动构成权限沙箱。宿主支持时采用只读执行环境；共享工作区则记录此限制、检查评审前后源码/参数/证据指纹，发生意外修改时作废本轮并恢复后重新捕获。不能声称已有工具级写入隔离。
5. 主控核验报告和工程证据、计算门槛；实现者只能提交修复或有证据的异议，不能改分或关闭自己造成的问题。异议交给独立 Critic 核查，保留原报告与处置依据，新增评审计入对应阶段预算，禁止反复换人挑选高分。
6. 槽位不足时释放已完成执行者或串行调度，交接文件保留进度；不同角色无需同时在线。若仅够主控加一个执行者，Producer 输出问题后释放，Director 回答后释放，再由新的 Producer 会话读取问题和回答复核。Lead_Dev 先输出模块任务包并退出，由主控代为启动 Specialist，结束后重新启动 Lead_Dev 读取模块产物集成，不能让父执行者占槽等待无法启动的子代理。不要求不同模型，也不把新建 CLI 进程本身当作隔离证明，必须检查是否恢复了旧会话或加载了无关历史。

`RUN/state.json` 引用各阶段交接、讨论和评审路径，记录会话身份与工具能力限制。完整管线缺少真实独立讨论或评审时不能标为完整通过；用户明确接受单 Agent 降级时保留该豁免与验收缺口。

## 蓝图字段

BLUEPRINT.json 至少包含：

- coordinateSystem：up axis、单位和缩放、原点、旋转单位及空间约定。
- cameraPresets：键为 overview、closeup、lowangle。各项包含 projection、position、lookAt、near、far；透视相机含 fov，正交相机含视锥范围。校验 near/far、FOV 及非退化观察方向。
- modules：唯一 id、position、dimensions、rotation、世界空间 bounds、材质引用和必要的 allowedOverlapWith/碰撞信息。
- 使用局部坐标时记录 parent/变换关系。用真实几何边界验证规划，手写 AABB 不是没有穿模的证明。

## 曲面与附着（仅用于存在坡面、拱桥或曲线路径的场景）

- 在蓝图的 surfaces 中记录唯一 surfaceId、类型、有效区域、坐标系/父变换和几何参数。附着模块通过 surfaceId 引用承载面，声明局部接触锚点、朝向策略，以及沿法线或竖直方向的偏移和允许接触误差。JSON 保存参数与引用，不存待 eval 的函数源码。
- 单值高度场可实现 `getSurfaceY(x, z, surfaceId)`；更一般的接口使用 `sampleSurface(surfaceId, coordinates)` 返回约定坐标系内的 position、normal 和可用 tangent。对高度场，coordinates 为局部 x/z；对曲线路径可用弧长 s 和横向偏移。约定输入输出空间，放置前转换到模块父节点空间；法线使用正确的法线变换，不能当作位置变换。
- 高度场 `y = f(x, z)` 仅适用于每个 x/z 对应唯一高度的表面。桥面与桥下地面分别指定 surfaceId；垂直面、悬挑或多值结构使用参数曲面或对指定承载网格的射线查询。不要总取整个场景的最高命中点，也不要让物件射线命中自身。超出有效区域或没有命中时明确失败，不默认返回 y=0。
- 网格生成、附着定位和碰撞查询复用相同表面定义。数学曲面与离散网格仍可能有误差，须按实际网格分辨率、接触容差检查；不能仅因使用同一公式就认定没有浮空。
- 先按朝向策略旋转物件，再将其局部接触锚点对齐目标表面位置及约定偏移，不把模型中心直接放到表面高度。贴坡物件可对齐法线并保留指定朝向；树木、桥墩或立柱可保持世界竖直。沿路径布置的栏杆、轨道采用切线和稳定的局部坐标框架，检查转弯和分段处的翻转或突变。
- 对跨度较大的底面、跨坡段栏杆或多支脚物件，采样多个接触点。刚体底面不能自动贴合任意曲面：按设计选择分段、支脚调节或明确允许的间隙，不能只采样中心点。桥墩底部接地、顶部承托桥底须使用两个独立连接点，并计入桥面厚度；不是把所有部件都吸附到桥面。
- 验收覆盖有效区域边界、坡度变化和段接缝，检查接触误差与朝向是否符合蓝图。含多层结构时分别验证桥上和桥下对象。结合 closeup/lowangle 视图检查浮空、穿入、栏杆断接，并将实际失败纳入几何评审；简单平面场景无需引入这套接口。

## 浏览器接口

| 接口 | 契约 |
| --- | --- |
| window.sceneReady | Promise：必要模型、纹理、字体、着色器及首帧就绪后 resolve；必要资源失败则 reject。 |
| window.setCameraMode(mode) | 支持 overview / closeup / lowangle / wireframe；未知模式抛错。返回 Promise，在目标模式实际渲染后 resolve。 |
| window.applyTuningParams(params) | 校验值域并应用，返回 Promise，在参数生效且完成渲染后 resolve；错误参数明确失败。 |
| ?clean=1 | 隐藏 HTML UI、调试辅助对象及非交付叠层，保留场景主体。不能只隐藏 DOM 而遗漏三维辅助线。 |

线框复用 overview 机位；兼容单材质和 Material[]，保存并恢复原始 wireframe 值，去重共享材质。自定义 shader 不支持线框时使用可恢复的覆盖层。返回普通视图时恢复材质和后处理状态。

相机切换匹配透视/正交投影并更新投影矩阵和控制器。使用 composer 时通过真实后处理管线绘制，不绕过效果。不能只改模式名却不切换机位。

固定随机种子、动画时刻、视口、DPR 和捕获模式。动画场景提供冻结/跳转时间能力，捕获后恢复交互。不要用任意等待 300ms 代替资源及画面就绪检查。

## 模型导出

默认交付的 HTML 场景单页必须提供 OBJ 与 GLB 两种本地下载入口，优先使用项目所装 Three.js 版本配套的 `OBJExporter` / `GLTFExporter`；核对该版本实际支持的对象与参数。无需为了导出上传模型或增加后端服务。

### 控件与导出内容

- 页面提供清楚可见的「导出 GLB」「导出 OBJ」按钮，或一个带这两个选项的导出菜单。等待 `sceneReady` 后才能操作；导出中显示状态、防止重复触发，失败时给出可读提示并恢复操作。`?clean=1` 隐藏这些控件。
- 使用明确的模型根节点或导出白名单，默认包含完整主体、道具和实际模型底座，排除调试辅助线、碰撞代理、预览用背景/接影平面、灯光、相机及 HTML UI。真实模型地面与预览接影平面应分开标识。不要直接导出整个预览 Scene，也不能用截图冒充模型文件。
- 默认导出当前模型的静态姿态与已应用材质，保留约定的单位、坐标、部件变换、法线与 UV。快照在同一动画时刻取得；线框查看模式不应改变导出材质。不擅自把模型整体缩放到单位大小或改原点。
- 在隔离的快照/副本上处理导出，更新世界矩阵并保留父级变换。项目存在实例、骨骼、形变或程序化几何时，按格式支持正确转换或烘焙当前姿态，不能静默丢失实例或部件。不得释放与实时场景共享的几何、材质或贴图；导出成功或失败后，视角、动画、材质和交互应继续正常工作。

### 格式约定

- **GLB**：生成实际二进制 `.glb`，模型所需的受支持材质与贴图打包在文件内；动态 canvas 贴图也须验证能重载。不能把 JSON 文本改扩展名当 GLB。自定义着色器、后处理、网页交互和预览投影不保证随模型保留；必要时使用相近的标准材质，并说明实际差异，不承诺与预览逐像素一致。动画片段仅在需求明确包含且实现了导出时交付。
- **OBJ**：默认提供几何 `.obj`，入口旁简短注明“几何模型；保留材质请选 GLB”。Three.js 的 `OBJExporter` 本身不生成 MTL/贴图，不能宣称原生完整保色。需求包含 OBJ 材质时，另实现并验证 `.obj + .mtl + 贴图` 配套导出，可打包 ZIP，确保相对引用有效。
- 文件名包含可辨认的项目名与正确扩展名。通过 Blob 和下载链接交给浏览器保存，下载触发后妥善撤销临时 Object URL，并清理临时元素与独立导出资源；失败不能提示成功。

### 验证与证据

1. 从正常单页实际点击两个入口，捕获下载并检查非空及正确格式。将样例保存到 `RUN/exports/<exportCheckId>/`；每次验证使用新 ID，不覆盖历史证据。仅调用导出函数或检查按钮存在不算下载验收。
2. 分别用对应 Loader 或独立解析器重载文件：确认 OBJ 有有效顶点/面，GLB 结构有效；比较导出范围内的关键部件、实例、整体包围盒与单位/朝向。按项目尺度设定合理容差，不能只用“文件非空”判断模型完整。
3. 验证 GLB 的关键材质和贴图重载正常，无丢失资源；含招牌或纹理时实际查看重载结果。OBJ 只承诺几何时按几何验证，提供 MTL 时连同材质与引用一起检查。
4. 检查连续导出、错误反馈及导出后的场景交互仍可用；错误路径可用受控导出失败验证。静态导出不应留下冻结动画、临时线框或克隆模型等副作用。
5. 在同一目录保存 `checks.json`，记录源码/参数指纹、格式、文件名/大小/哈希、导出范围与姿态、重载检查、材质限制及错误。将结果引用到运行 state 和最终交付说明。最终几何、材质或默认参数变化后重跑受影响检查，保留与最终版本匹配的两种样例。

导出检查是工程验收的一部分，不由视觉评分替代。用户明确排除时可记录 `not_applicable`；默认所需格式未通过时如实记录未完成，不能把占位按钮或格式能力限制当作成功。

## 截图命令

目标工程提供以下语义，已有工具可通过适配实现：

```text
node scripts/capture_views.mjs --run-id <runId> --capture-id <captureId> --url <sceneUrl>
```

- 在 projectRoot 执行。runId/captureId 只接受安全的单层目录名，拒绝绝对路径、路径分隔符及 ..。
- 显式 URL 表示复用服务；自动启动模式需提供工程启动命令和工作目录，等待 HTTP 就绪并记录实际 URL。只清理本次启动的服务与浏览器。
- 正确合并 clean=1 到已有查询参数，等待 sceneReady，逐个 await 相机模式接口后截取 canvas/指定场景容器。
- 记录 pageerror、必要资源失败和 WebGL context loss。超时或必要条件失败时退出非零，不留下成功 manifest。
- 输出 artifacts/<runId>/<captureId>/{overview,closeup,lowangle,wireframe}.png 和 manifest.json。校验图像非空、可解码、尺寸符合预期；视觉检查不能是空白，通过相机状态及图像确认模式切换生效。
- manifest 在所有截图和检查通过后写入，包含 runId、captureId、时间、URL、视口/DPR、种子/动画时刻、源码/参数指纹、每图路径和相机状态、浏览器错误清单。
- 使用有限启动/导航/就绪超时，在 finally 关闭本次创建的浏览器及服务。失败保留诊断，不把部分图像当作完整四视图。

## 评审 JSON 与判定

每次保存 JSON，可另附简短 Markdown。以下仅为结构示例，不能照抄示例评分：

```json
{
  "runId": "example-run",
  "captureId": "pass_1",
  "manifest": "pass_1/manifest.json",
  "reviewer": {
    "agentId": "actual-session-id",
    "handoff": "handoffs/critic-pass-1.json"
  },
  "scores": {
    "geometry": 8,
    "layout": 8,
    "lighting": 9,
    "materialStyle": 8
  },
  "rationale": {
    "geometry": "Describe observed proportions.",
    "layout": "Describe spatial evidence.",
    "lighting": "Describe lighting and composition.",
    "materialStyle": "Compare with the chosen style."
  },
  "issues": [
    {
      "id": "G1",
      "severity": "major",
      "view": "lowangle",
      "module": "hero",
      "observation": "Describe a visible defect and its location.",
      "fix": "Describe a correction.",
      "verify": "Describe an observable acceptance condition."
    }
  ],
  "checks": {
    "build": "passed",
    "runtime": "passed",
    "interaction": "passed",
    "capture": "passed"
  }
}
```

主控将 reviewer 与真实调度记录核对，确认是未参与实现的新会话，不只相信报告自述。校验四项分数都是 0–10 的有限数值、字段完整、图像和版本匹配；severity 限定 blocker / major / minor。缺字段、格式损坏、无法查看图像或非本轮结果属于失败，不能默认通过。

执行者/调度器计算算术平均值，不使用四舍五入后的显示值判断阈值。均分 ≥ 9.0、无未解决 blocker/major、必要检查有可查证的通过结果才通过；不信任模型自报的 passed 布尔值或孤立标记文件。无需构建/无交互需求时可用 not_applicable，但必须依据工程和 SPEC 记录原因；运行时与截图检查不可豁免。

issues 表示当前未解决问题，历史问题保留在旧报告。修改后重新截图和评审；预算耗尽记为 failed 并停止后续依赖阶段，自动化入口退出非零。后续改动回归时恢复保存的通过版本并复验，或保持 failed，不伪造达标。

## 外部 CLI（按需）

先确认可执行文件、版本、登录状态、工作目录及本机 --help。子进程不保证继承当前会话的图像、生图、浏览器工具或权限，逐项确认必要能力。

Codex 参数形式示例（以安装版本帮助为准）：

```text
codex exec --sandbox workspace-write --cd <projectRoot> "Read <absolute SKILL.md path> and the specified stage inputs; execute only stage N."
codex exec --sandbox read-only --cd <projectRoot> --image <overview.png> --image <closeup.png> --image <lowangle.png> --image <wireframe.png> "Review the attached views against SPEC.md and return critic JSON. Do not modify scene files."
```

- 不依赖旧版本 --full-auto；非 Git 目录确认目标路径后按需加 --skip-git-repo-check，不擅自初始化仓库。
- 提示词包含技能绝对路径、目标阶段、runId、输入及输出位置。提示词文件需读取内容或通过受支持的 stdin 传入，不能假设文件名会被自动加载。
- 四图按实际路径逐一附加，不把未展开的通配符当作附件。只读评审由父执行者验证和保存 JSON，不要求只读子进程写报告。
- CLI 支持结构化输出时可提供 schema 并解析，仍需检查语义和证据。
- Claude Code 核对帮助后可用 claude -p <prompt>；Gemini 先核对 gemini --help 的非交互语法。CLI 缺失或选项未知时明确失败，不静默跳过。
- 不默认加入跳过权限或关闭沙箱的选项；权限不足时报告实际阻塞。
- PowerShell 不能原生执行 Bash 文件，使用可运行的 Git Bash/WSL 或原生执行器。WSL 与 Windows 的工具及路径不自动互通。
- 外部脚本只能在满足本契约时作为执行器。旧的角色模拟或流程串联脚本如果没有实现独立讨论、只读 Critic 及本契约的验收门槛，需先适配，不能直接作为合规入口。正常退出不代表业务通过，父执行者仍要逐阶段验收。设置有限超时并记录失败，不通过重新开会话无限重试。
