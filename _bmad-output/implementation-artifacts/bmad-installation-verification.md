# BMAD 安装与演示验证报告

日期：2026-10-25（Asia/Shanghai）。根目录：`E:\project\管理后台\dvadmin`。

## 安装结果

- npm 官方注册表：`latest=6.12.4`，`next=6.12.3-next.1`；显式固定稳定版 6.12.4。
- 官方安装器：core + bmm，`--tools codex`，不装弃用 shim；退出码 0。
- 交流/文档语言：Chinese；项目名 dvadmin；知识目录 docs；输出目录 `_bmad-output`。
- 项目内有 29 个技能；用户级 Codex 模型、供应商、认证、权限、插件配置未改动。
- 持久中文覆盖：`_bmad/custom/config.toml`；个人安装答案、个人定制、渲染快照均由 Git 忽略。

## 实际执行与结果

| 检查 | 命令或方法 | 结果 |
| --- | --- | --- |
| 安装检查 | `python scripts/check_bmad.py` | 退出 0；29 技能、214 个资源 SHA-256 通过 |
| 合并配置 | `uv run _bmad/scripts/resolve_config.py --project-root 'E:\project\管理后台\dvadmin'` | 退出 0；中文和路径正确 |
| 技能定制 | 官方 `config_utils.load_customization` 逐个解析包含 customize.toml 的技能 | 27 份通过；另外 2 个无该配置文件，不要求解析 |
| Build 运行时 | `uv run --no-cache _bmad/scripts/render_skill.py --project-root 'E:\project\管理后台\dvadmin' --skill 'E:\project\管理后台\dvadmin\.agents\skills\bmad-build'` | 退出 0，生成 workflow.md 及步骤快照 |
| 新增工具测试 | `python -m unittest discover -s scripts/tests -v` | 14 项通过 |
| 项目前端单元测试 | 在 web/ 使用 fnm Node 24.20.0 执行 `node --test scripts/tests/*.test.mjs` | 82 项通过，0 失败；有既存 MODULE_TYPELESS_PACKAGE_JSON 提示 |
| Git 忽略规则 | `git check-ignore` 检查个人 TOML 和渲染快照 | 均被忽略 |

## 需求到代码演示

- 目标：提供可重复运行、失败时明确报错的 BMAD 安装验证工具。
- 规格：同目录 `spec-bmad-installation-check.md`，包含问题、方案、Given/When/Then 验收和实现记录。
- 实现：`scripts/check_bmad.py`。只读检查，不联网、不启动服务、不连接业务数据库。
- 测试：`scripts/tests/test_check_bmad.py` 使用临时目录夹具，不损坏真实安装。
- 按安装后的 bmad-build 小改动路径进行规划、实现和独立审查；实际技能目录结构与文档均已读取。保留既有工作树，未做自动提交、推送或部署。
- 独立审查发现的路径误判、漏检资源、错误类型配置及版本误匹配已修复，相关用例均已通过。

## 限制与排障证据

- 初次网络访问在沙箱返回 ENOTFOUND，正常权限读取 npm 成功；没有持久修改网络设置。
- uv 初次在 Windows 沙箱返回临时缓存 `Access denied / os error 5`；正常权限运行渲染与解析后通过。
- unittest 的系统临时目录在沙箱不可写；正常权限执行全部通过。
- 安装器清单中的技能源路径是逻辑路径，实体在 `.agents/skills/`；检查器已正确映射。5 个发布清单里的 Python 缓存条目未实际分发，验证时忽略缓存。
- 已确认元数据、资源、配置和 Build 渲染运行时；未声称所有 29 个交互流程均完整执行。
- 当前对话启动时的技能列表不会自动反映新增文件；需在此项目新开对话或重新打开 Codex，检查技能选择器。未用界面实际确认新会话技能发现。
- 未运行 API/E2E、数据库测试或完整前端构建；本次修改涉及 BMAD 配置和独立验证工具，没有改变业务代码。
- 更大业务需求的 PRD → 架构 → 故事 → Sprint → 实现 → QA 顺序及可复制提示在 `docs/BMAD-CODEX.md`，属于操作演示，不代表用户管理导出功能已实施。

官方依据：[稳定分支 README](https://github.com/bmad-code-org/BMAD-METHOD/blob/V6.12/README.md)、[安装文档](https://docs.bmad-method.org/start/install-bmad/)；具体参数与技能名以 6.12.4 安装器帮助及项目内技能清单为准。
