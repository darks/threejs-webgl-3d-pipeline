# Three.js / WebGL 3D Pipeline

用六阶段、多 Agent 协作，把场景描述变成可运行、可交互、经过截图评审的 Three.js 作品。

这是一个 **AI 编程技能和示例仓库**，不是 Three.js 渲染引擎、在线生图服务或一键模型生成 API。技能定义需求讨论、空间蓝图、模块开发、独立评审、灯光比较、材质精修和模型导出流程。

[安装技能](docs/installation.md) · [使用说明](docs/usage.md) · [示例说明](examples/README.md) · [参与贡献](CONTRIBUTING.md)

## 三个 Demo

| 示例 | 预览 | 内容 | 形态 |
| --- | --- | --- | --- |
| [Juniper 邮电局](examples/postal.html) | ![邮电局](docs/images/postal.png) | 低多边形建筑、投信、电报灯、机位和线框 | 独立 HTML + [模块源码](examples/postal-diorama/) |
| [Maple & Co. 街角百货](examples/store.html) | ![百货店](docs/images/store.png) | 日夜切换、商品部门介绍、街角视角 | 内嵌 Three.js 的独立 HTML |
| [London Eye 河畔微缩景观](examples/london-eye.html) | ![伦敦眼](docs/images/london-eye.png) | 摩天轮旋转/暂停、河岸场景、机位和线框 | 内嵌 Three.js 的独立 HTML |

截图来自实际浏览器渲染。三个示例现在都提供独立 HTML，下载后即可用浏览器打开，不需要安装 Node.js 或启动服务器。

**在 GitHub 上**，表格链接打开的是 HTML 文件页；请下载原始文件并保存为 `.html` 后打开。GitHub 文件页本身不会执行页面。运行下方命令则可从本地首页直接进入三个 Demo。

## 本地运行示例

克隆仓库（也可以下载 ZIP 并解压）：

```sh
git clone https://github.com/darks/threejs-webgl-3d-pipeline.git
cd threejs-webgl-3d-pipeline
```

需要 **Node.js 22.12+** 和支持 WebGL 的现代浏览器。在仓库根目录执行：

```sh
npm ci
npm run dev
```

打开终端显示的本地地址，默认 `http://127.0.0.1:5173/`。也可直接打开 `examples/postal.html`、`examples/store.html` 或 `examples/london-eye.html`。其中邮电局独立版由模块源码自动打包；编辑模块源码后，运行 `npm run build:postal` 更新独立版。

```sh
npm run check
npm run build
npm run preview
```

构建结果在 `dist/`，包含总览和全部三个示例，使用相对资源路径，可部署到静态站点子目录。启动 preview 后打开终端地址。仓库不自动发布站点。

## 安装技能

安装技能本身不需要 `npm ci`。有 Node.js 时，在本仓库根目录运行：

```sh
node scripts/install-skill.mjs
```

默认安装到 `$CODEX_HOME/skills/threejs-webgl-3d-pipeline`；未设置 `CODEX_HOME` 时使用 `~/.codex/skills/threejs-webgl-3d-pipeline`。已有同名目录时停止，避免覆盖个人修改。也可以完整复制 [skills/threejs-webgl-3d-pipeline](skills/threejs-webgl-3d-pipeline) 文件夹。详见 [安装说明](docs/installation.md)。

使用示例：

```text
$threejs-webgl-3d-pipeline 制作一个欧美低多边形卡通风的邮电局。
所有产出放在一个新的独立目录，支持旋转、缩放、投信和电报灯互动。
```

## 工作流程

1. **需求与概念**：Producer 与 Director 独立讨论，形成 SPEC 和视觉基准。
2. **空间蓝图**：Architect 明确坐标、尺度、相机、模块和接触关系。
3. **构建与导出**：Lead_Dev 委派模块开发，建立交互、参数、OBJ/GLB 导出和四视图捕获。
4. **独立评审**：新的只读 Critic 实际看图，检查几何、布局、光影与风格。
5. **灯光比较**：相同机位、种子和时刻比较候选，保留参数和选择依据。
6. **材质精修**：保存可恢复版本，对照目标图改进，再检查、截图与独立复核。

视觉门槛为四项算术均分至少 9.0、没有 blocker/major，并且工程检查通过。评分是记录评审依据的方式，不是客观质量保证。完整规则和预算以 [SKILL.md](skills/threejs-webgl-3d-pipeline/SKILL.md) 与 [执行契约](skills/threejs-webgl-3d-pipeline/references/execution-contract.md) 为准。

## 能力边界

- 完整管线需要宿主支持独立 Agent 上下文、文件/命令操作、浏览器自动化和实际图像查看。仅有文本聊天不能完成全部验收。图像生成是可选能力，缺失时需记录降级。
- 新版技能默认要求 HTML 单页提供 **GLB / OBJ 导出**，并验证下载和重新载入。**这三个现有展示示例尚未实现导出按钮**，用于展示场景、交互和组织方式，不应当作最新契约全部通过的模板。
- 商店与伦敦眼独立 HTML 含压缩后的应用和 Three.js，本仓库没有它们的模块源文件或原始打包工程。邮电局同时提供模块源码和可重新生成的独立版。
- 技能要求的软件、模型调用和浏览器环境由使用者提供。性能取决于设备；本仓库不沿用原制作设备的历史性能数值作为你的运行结果。

## 验证

```sh
npx playwright install chromium
npm run build
npm run test:smoke
npm run test:standalone
```

检查脚本会启动临时预览服务，验证三个示例的加载、机位、基础交互与移动视口，保存截图和结果到忽略版本控制的 `artifacts/smoke/`。可用 `CHROMIUM_PATH` 指向已有 Chromium。此检查是发布包冒烟验证，不等于重新执行六阶段创作评审。详情见 [测试说明](docs/testing.md)。

## 目录

```text
skills/threejs-webgl-3d-pipeline/   可安装技能与执行契约
examples/postal.html              邮电局独立 HTML（从模块源码生成）
examples/postal-diorama/           邮电局模块源码、参数、规格与检查脚本
examples/store.html               百货店独立 HTML
examples/london-eye.html          伦敦眼独立 HTML
docs/                            安装、使用、测试说明与实际截图
scripts/                         安装、包检查、浏览器冒烟验证
index.html                       三个示例的总览入口
```

## 许可证

项目原创代码、技能文档和示例内容使用 [MIT](LICENSE)。内嵌及依赖的 Three.js 保留其 MIT 版权声明，见 [第三方说明](THIRD_PARTY_NOTICES.md)。截图仅用于展示本仓库示例；示例中的名称、地点和文字不表示与现实机构存在关联。
