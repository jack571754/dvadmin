# BMAD · 当前 Codex 项目使用说明

核验日期：2026-10-25（Asia/Shanghai）。项目根目录：`E:\project\管理后台\dvadmin`。

## 已安装配置

安装官方 `bmad-method@6.12.4`，包含 core 和 bmm，工具目标仅为 Codex，未安装弃用兼容 shim。官方目前推荐稳定需求使用 v6.12；主分支和在线文档大部分已转向 v7 preview alpha，不要把两条版本线的安装和命令混用。

本次使用的完整安装命令如下。**这是重装/更新配置命令，不是日常启动命令。**

```powershell
npx --yes --registry=https://registry.npmjs.org bmad-method@6.12.4 install --directory 'E:\project\管理后台\dvadmin' --modules bmm --tools codex --user-name 'DVAdmin' --communication-language 'Chinese' --document-output-language 'Chinese' --output-folder '_bmad-output' --set 'core.project_name=dvadmin' --set 'bmm.user_skill_level=intermediate' --set 'bmm.project_knowledge=docs' --no-shims --yes
```

安装参数由该版本的 `install --help`、`--list-tools`、`--list-options` 实际确认。不要把 BMAD 加到 `web/package.json` 的运行依赖。

| 位置 | 用途 |
| --- | --- |
| `.agents/skills/` | 29 个 Codex 技能及其模板、步骤和脚本 |
| `_bmad/_config/manifest.yaml` | 安装版本及模块记录 |
| `_bmad/_config/bmad-help.csv` | 当前版本可用流程与技能名 |
| `_bmad/config.toml` | 安装器管理的团队基础配置 |
| `_bmad/config.user.toml` | 个人安装答案，已忽略 Git |
| `_bmad/custom/config.toml` | 持久团队覆盖，固定中文交流与文档 |
| `_bmad/custom/*.user.toml` | 个人覆盖，安装器已生成忽略规则 |
| `_bmad/render/` | 工作流渲染快照，已忽略 Git |
| `_bmad-output/planning-artifacts/` | PRD、架构、Epic 等规划产物 |
| `_bmad-output/implementation-artifacts/` | 实现规格、状态及验证报告 |
| `AGENTS.md` | Codex 项目约定，衔接已有根级与模块级 `CLAUDE.md` |

配置合并顺序：`config.toml` → `config.user.toml` → `custom/config.toml` → `custom/config.user.toml`。基础文件里的英文默认值不代表最终配置；本次官方解析器已验证合并后的语言为 Chinese。

## 环境与现有配置检查

- 当前 Codex CLI：`0.164.0-alpha.11.1`；已有全局模型、供应商、插件和权限配置保持原样。
- 当前 shell：Node `20.20.2`、Python `3.13.2`、uv `0.7.8`；满足本次 BMAD 运行需求。渲染脚本实际声明 Python `>=3.11`，因此这里采用 3.11+，不只依赖 README 的 3.10+ 概述。
- 前端另有 Node `>=24 <25`、pnpm `11.25.0` 的要求。已使用本机 fnm 的 Node `24.20.0` 跑单元测试；它满足 engines，但与 `web/.node-version` 的精确版本 `24.22.1` 不同。
- 项目存在大量先前未提交改动，本次没有恢复、提交或修改这些业务差异；本次也没有执行部署、数据库迁移或数据初始化。
- BMAD 官方安装器已读取和生成项目内配置。项目本来没有 BMAD/Codex 本地技能目录；已有 Claude/Kilo 目录保留。

## 在 Codex 中开始

在这个项目中新开一个对话，让 Codex 重新发现项目技能；若技能选择器仍不显示，重启 Codex 后再打开项目。当前会话的初始技能目录不会因磁盘写入自动刷新，本次直接读取安装后的技能文件并验证运行时。

向 Codex 发送以下提示，`$技能名` 是对话里的技能引用，**不是 PowerShell 命令**：

```text
$bmad-help
这是已有的 DVAdmin 项目。请依据当前工作树和 docs 判断接下来需要什么流程，使用中文。
```

小需求可以直接用：

```text
$bmad-build
为这个已存在的项目实现一个明确的小改动：[写需求和验收标准]。
先阅读 AGENTS.md 与对应模块文档，保留无关改动，完成相关测试后给出结果。
```

v6.12.4 的 Build 会先调查、规划，再按改动大小选择 oneshot 或完整规格与交接流程。较复杂任务会有规格确认点；工作树有已有改动时，应先明确允许处理的范围。不要为跳过确认而把规格虚标为已批准。

## 从需求推进到实现与测试

以下是较大业务需求的使用顺序示例，**并未在本次安装中执行这些业务变更**。每个阶段建议新开对话，传入上阶段的实际产物路径，减少上下文混杂。

示例需求：“为现有用户管理增加导出功能，服从当前用户的数据权限和字段权限。”

| 阶段 | 技能及提示要点 | 应得到的结果 |
| --- | --- | --- |
| 需求 | `$bmad-prd`：创建 PRD；先检查现有用户 API、导出组件与权限实现，定义允许导出的数据和验收标准 | PRD，包含范围、非目标、权限边界、失败行为 |
| 交互（需要时） | `$bmad-ux`：只设计新增导出入口、加载状态和错误反馈 | UX 决策，复用现有 UI 模式 |
| 技术设计 | `$bmad-architecture`：读取 PRD 和现有前后端代码，记录 API、权限过滤、字段白名单、下载行为 | 有实际文件依据的架构决策 |
| 拆分 | `$bmad-create-epics-and-stories`：把 PRD/架构拆成依赖有序的故事 | Story 与 Given/When/Then 验收标准 |
| 排期 | `$bmad-sprint-planning`：检查规划是否足以实施，再生成状态 | sprint-status.yaml |
| 实现 | `$bmad-build`：指定某一条 Story/规格的实际路径，完成代码和对应测试 | 实现、Build 规格与测试证据 |
| 复查 | `$bmad-code-review`：明确仅审查这条 Story 的文件/提交差异 | 可操作发现及修复结果；Build 本身也包含审查 |
| 补测试 | `$bmad-qa-generate-e2e-tests`：针对已实现的功能补 API/E2E 测试 | 正向、越权、空数据、失败等用例 |

如只是把现有需求材料整理成短规格，可以先用 `$bmad-spec`，再把实际 `SPEC.md` 目录及其 companions 交给 Build。不要使用 v7 教程中的 `bmad setup` 或 `bmad-agent-po` 来指导当前 v6 安装。

测试要与改动相关。前端命令在 `web/` 执行 `pnpm test:unit`、`pnpm lint`、`pnpm typecheck`；API/E2E 使用隔离设置和 8210/9010 等独立端口，先检查配置再启动。测试技能生成了代码，不等于测试已经运行通过。

## 本次已完成的可运行演示

演示目标是“可靠验证 BMAD 安装”，实现无需业务数据库的只读工具：

1. 需求与验收标准：`_bmad-output/implementation-artifacts/spec-bmad-installation-check.md`。
2. 实现：`scripts/check_bmad.py`，使用官方配置合并器，验证安装版本、技能元数据和资源哈希。
3. 测试：`scripts/tests/test_check_bmad.py`，在独立临时安装中验证缺技能、缺资源、资源损坏、重复 ID、路径越界、无效配置、空描述和 CLI 退出码。
4. 独立审查：发现并修复逻辑源路径误判、漏检资源、配置类型异常和版本误匹配；详情在实现规格的审查记录。
5. 证据：`_bmad-output/implementation-artifacts/bmad-installation-verification.md`。

从项目根执行：

```powershell
python scripts/check_bmad.py
python -m unittest discover -s scripts/tests -v
uv run _bmad/scripts/resolve_config.py --project-root 'E:\project\管理后台\dvadmin'
```

健康检查成功应输出 `ok: true`、`skills_checked: 29`、`resources_checked: 214`，退出码为 0。它校验静态资源和官方配置解析；Build 的渲染另以官方渲染命令进行了冒烟验证。这不意味着所有 29 个交互式流程都已完整跑过。

本机 Windows 沙箱曾阻止 uv 缓存及测试临时目录写入，使用正常本机权限后通过。若再次遇到相同的 `Access denied / os error 5`，应检查执行权限；不要据此重装 BMAD 或修改全局代理。

升级时先检查官方稳定版本，显式固定包版本；升级后重跑以上检查。检查器目前有意固定 6.12.4，升级时需同步审阅版本断言和资源映射规则。项目文件尚未自动提交。

## 官方参考

- [BMAD 主仓库：稳定版与预览版说明](https://github.com/bmad-code-org/BMAD-METHOD)
- [V6.12 分支 README](https://github.com/bmad-code-org/BMAD-METHOD/blob/V6.12/README.md)
- [官方安装页：稳定版入口与 v7 范围说明](https://docs.bmad-method.org/start/install-bmad/)
- [OpenAI：项目级技能与工作流](https://developers.openai.com/blog/skills-agents-sdk)

版本参数、技能名称和配置合并行为以本次实际安装的 6.12.4 文件与 CLI 帮助为准。
