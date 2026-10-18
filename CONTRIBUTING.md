# Contributing

欢迎提交技能规则、示例或文档改进。先描述具体问题及预期行为，再提交尽量小的改动。

修改技能时保留真实独立评审、版本对应和失败记录要求；不要把某个 Demo 的设计选择变成所有项目的强制风格。入口说明放在 `SKILL.md`，详细契约放在 `references/`。

修改示例后运行：

```sh
npm ci
npm run check
npx playwright install chromium
npm run build
npm run test:smoke
npm run test:standalone
```

提交截图变化时说明实际影响；需要刷新 README 截图可执行 `node scripts/smoke.mjs --update-previews`。邮电局修改后运行 `npm run build:postal`，提交更新后的 `examples/postal.html`，不要手改生成文件。保留全部独立 HTML 中的第三方许可。若更改它们的应用代码，同步更新 `examples/provenance.json` 的分发哈希和变更说明。

不要提交 API 密钥、个人绝对路径、node_modules、浏览器缓存、私有会话或与本次改动无关的运行日志。提交内容应允许按本仓库 MIT 许可证分发。
