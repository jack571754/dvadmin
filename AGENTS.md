# DVAdmin · Codex 项目约定

- 当前仓库是 Django + Vue 3 后台。先读根 `CLAUDE.md`、`START.md`，再按改动范围读模块级 `CLAUDE.md`；命令以实际配置为准。
- 保留现有未提交改动。仅处理当前需求涉及的文件；不要批量恢复、清理、提交其他改动。
- 前端使用 Node `>=24 <25`、pnpm `11.25.0`；精确版本见 `web/.node-version`。不要使用 npm 安装前端依赖。
- 前端验证入口见 `web/package.json`：`pnpm test:unit`、`pnpm lint`、`pnpm typecheck`。按改动范围选择检查。
- API/E2E 验证使用 `application.e2e_settings` 与隔离服务端口，先阅读 `web/playwright.config.ts` 和 `backend/scripts/prepare_e2e.py`；不要对真实业务库运行初始化或测试。
- BMAD 固定安装为 `6.12.4`（core + bmm），技能在 `.agents/skills/`。中文交流和文档；不覆盖 Codex 全局模型、认证或权限设置。
- 不知道下一步时使用 `$bmad-help`。小需求用 `$bmad-build`；大需求按 PRD → 架构 → Epic/Story → Sprint → Build 推进。实际技能名称以 `_bmad/_config/bmad-help.csv` 为准。
- 工作产物写入 `_bmad-output/`。持久团队定制写入 `_bmad/custom/`，不要直接改安装器管理的技能和共享脚本。
- 只将当前任务的差异交付审查；提交、推送、部署按用户明确要求执行。
