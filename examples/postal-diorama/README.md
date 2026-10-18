# Juniper 邮电局

奶油色墙面、绿色屋顶和红色邮筒的低多边形小镇场景。代码分为建筑、街景、材质及场景交互模块。

直接体验可打开 [邮电局独立 HTML](../postal.html)，不需要服务器或 Node.js。本目录保留可编辑模块源码；从仓库根运行 `npm ci`、`npm run dev` 可开发，运行 `npm run build:postal` 重新生成独立 HTML，完整 `npm run build` 也会自动更新它。

- `src/modules/building.js`：主楼、屋顶、台阶和电报侧翼。
- `src/modules/streetscape.js`：邮筒、包裹、树、长椅和电报杆。
- `src/main.js`：渲染、机位和投信/电报互动。
- `tuning_params.json`：默认颜色、灯光、阴影和相机。
- `SPEC.md` / `BLUEPRINT.json` / `PLAN.md`：制作规格与规划记录；其历史角色描述不代表本次发布重新做过独立评分。
- `reference/concept_target.png`：AI 生成的概念参考，非实际浏览器截图。

拖动旋转、滚轮缩放，点击红邮筒投信或点击电报窗口触发灯光，也可用按钮。`?clean=1` 隐藏 HTML 界面。当前示例尚未包含模型导出按钮。

完整浏览器检查可在本目录运行（先在本目录 `npm run dev` 启动独立开发服务；根目录安装的依赖可复用）：

```sh
npm run test:integration
node scripts/capture_views.mjs --run-id postal-example --capture-id pass_1 --url http://127.0.0.1:5173/
```

服务端口以终端实际输出为准。可通过 `SCENE_URL` 指定测试地址、`RUN_ID` 指定检查目录、`CHROMIUM_PATH` 指定浏览器。截图命令必须与先前通过的检查使用相同 run-id，并会拒绝覆盖既有 capture-id。此场景的部分阴影边缘仍偏硬；性能请以本机新运行的检查为准。
