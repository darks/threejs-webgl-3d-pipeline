# 验证项目

## 发布包检查

```sh
npm run check
```

不需要浏览器。检查文件、文档链接、独立 HTML 的分发哈希和第三方许可，并在 `artifacts/` 临时目录中验证技能安装、dry-run 和拒绝覆盖行为。不会修改用户真实技能目录。

## 浏览器冒烟检查

```sh
npx playwright install chromium
npm run build
npm run test:smoke
npm run test:standalone
```

脚本使用项目依赖中的 Vite 启动临时预览服务，默认端口 4178；端口被占用时失败，不复用未知服务。可设置 `SMOKE_PORT` 更换端口。脚本关闭自己启动的浏览器和服务。

使用已有浏览器可设置 `CHROMIUM_PATH`，例如在 PowerShell 中：

```powershell
$env:CHROMIUM_PATH = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
npm run test:smoke
npm run test:standalone
```

验证范围：生产构建中的三个场景实际渲染，四个机位真实变化，邮电局互动、商店日夜和部门面板、伦敦眼播放控制，移动视口加载，以及未出现运行时/资源错误。结果和截图保存到 `artifacts/smoke/`，不提交到 Git。

刷新 README 与首页图片：

```sh
node scripts/smoke.mjs --update-previews
npm run build
```

图片刷新后需要再构建，才能将新图片放入 dist。截图为 1440×1000，clean 模式去除页面 UI。验证不调用生图工具、不触发 Agent，不等于执行六阶段的独立视觉评审或最终模型导出验收。

`test:standalone` 将每个独立 HTML 单独复制到一个空目录，在离线浏览器中通过 `file://` 打开，确认无外部文件或网络请求，并检查邮电局投信、电报及视角操作。结果位于 `artifacts/standalone/`。

邮电局独立版由 `npm run build:postal` 从模块源码自动生成；完整构建会先执行此步骤。

邮电局还保留自己的集成检查与四视图脚本，入口见该示例的 README；其硬件性能记录必须在使用者机器上重新采样。
