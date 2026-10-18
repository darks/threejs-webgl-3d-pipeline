# 安装技能

先克隆仓库，或从仓库页面下载 ZIP 并解压：

```sh
git clone https://github.com/darks/threejs-webgl-3d-pipeline.git
cd threejs-webgl-3d-pipeline
```

## 安装内容

只需安装 `skills/threejs-webgl-3d-pipeline/` 整个文件夹，包括 `SKILL.md` 和 `references/execution-contract.md`。不要只复制入口文件，也无需把三个 Demo、node_modules 或整个仓库放进技能目录。

## 自动复制

取得本仓库后，在仓库根目录执行：

```sh
node scripts/install-skill.mjs
```

脚本使用系统 Node.js，不需要 npm 依赖。默认技能父目录为 `$CODEX_HOME/skills`；没有设置 `CODEX_HOME` 时为 `~/.codex/skills`。安装路径由当前用户环境决定，不含作者机器的绝对路径。

先预览目标而不写文件：

```sh
node scripts/install-skill.mjs --dry-run
```

安装到指定的技能父目录：

```sh
node scripts/install-skill.mjs --target /path/to/skills
```

Windows 示例：

```powershell
node scripts/install-skill.mjs --target 'D:\MyProject\.codex\skills'
```

脚本遇到同名目录会停止，不覆盖或合并文件。更新前请自行备份旧版本，再移走旧目录后安装，或使用文件比较工具合并修改。

## 手动安装

把 `skills/threejs-webgl-3d-pipeline` 完整复制到你的技能父目录。最终结构应为：

```text
<技能父目录>/threejs-webgl-3d-pipeline/
  SKILL.md
  references/
    execution-contract.md
```

技能目录选择以宿主支持的位置为准。将路径用于其他 Agent 工具时，需适配其技能发现和独立 Agent 调度方式；复制文件本身不会补齐这些工具能力。

## 确认可用

在支持该技能目录的宿主中重新开启会话或刷新技能列表，确认可选中 `threejs-webgl-3d-pipeline`。也可显式引用安装后的 `SKILL.md` 路径，并要求读取其执行契约。

安装仅写入指令文件。创建场景时仍需宿主提供独立 Agent、图像查看、浏览器和命令工具；技能不会自动配置 API 密钥、付费服务或替你发布内容。

## 运行示例是另一件事

技能安装完成后即可用于新任务；运行仓库内三个 Demo 则在仓库根执行 `npm ci && npm run dev`。两者互不依赖。
