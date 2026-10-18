# 三个示例

从仓库根运行 `npm ci`、`npm run dev`，然后打开首页。

| 路径 | 操作 |
| --- | --- |
| `postal.html` | 拖动、滚轮、四种视图、投信、电报灯、复位 |
| `store.html` | 拖动、缩放、四种视图、日夜切换、商品部门介绍 |
| `london-eye.html` | 拖动、缩放、四种视图、摩天轮暂停与播放 |

三个示例均为自包含 HTML，Three.js 内嵌，无 CDN 资源依赖，可单独下载并直接打开。文件中保留了完整 Three.js MIT 许可。邮电局的可编辑模块工程在 `postal-diorama/`，运行根目录的 `npm run build:postal` 可重新生成 `postal.html`；商店和伦敦眼的原始模块工程不在本仓库中。

商店和伦敦眼独立 HTML 仅补充完整第三方许可证注释；来源与分发文件的 SHA-256 记录在 [provenance.json](provenance.json)。邮电局调整了相对入口、移除了作者机器路径，并将检查工具改成可配置的浏览器路径。

三个现有示例均没有 OBJ/GLB 导出按钮。技能里的导出规范适用于新交付；不要以旧示例缺少按钮为由跳过新要求。
