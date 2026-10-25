---
title: 'BMAD 安装健康检查器'
type: 'chore'
created: '2026-10-25'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: ['{project-root}/AGENTS.md']
---

<frozen-after-approval reason="用户已授权安装、验证与代码测试演示；示例范围由本次任务确定">

## Intent

**问题：** 安装器成功退出并不能证明 Codex 技能副本、工作流资源和中文配置可用。需要能重复运行的项目本地检查。

**方案：** 使用 Python 3.11+ 标准库实现只读 CLI，检查固定版本 6.12.4、技能清单及 Codex 副本，并调用官方配置解析器确认中文和项目名。成功退出 0，失败退出 1 并输出 JSON。

验收：Given 完整安装，When 执行检查，Then 输出成功和技能数量；Given 缺少资源、版本不匹配、重复技能、非法路径或无效配置，When 执行检查，Then 明确失败。检查不启动业务服务、不连接数据库、不联网、不修改安装文件。

</frozen-after-approval>

## Implementation Notes

- 采用小改动 oneshot 路径；现有工作树有大量业务改动，本次授权仅覆盖独立新增的安装、验证及演示文件，不将原有差异纳入实现或审查。
- `scripts/check_bmad.py`：检查安装与配置；`scripts/tests/test_check_bmad.py`：临时目录内构造损坏安装场景。
- 复用 `_bmad/scripts/resolve_config.py` 的官方四层合并，不另写配置合并规则。
- 正式安装检查结果：29 个技能、214 个技能资源通过；Python 14 项测试通过；原有前端 82 项单元测试通过。
- 安装后的 CSV 保留逻辑源路径，实体位于 `.agents/skills/`。按技能 ID 映射文件清单并验证 SHA-256；忽略安装器未分发但清单残留的 Python 缓存文件。
- 无用户要求的 Git 提交或推送；交付当前任务的新增文件供审查。

## Review Triage Log

- medium / patch：逻辑源路径被当作实体导致健康安装误报；改用 Codex 目录和资源清单映射，真实安装回归已通过。
- medium / patch：只读 SKILL.md 会漏掉工作流资源损坏；增加 214 个文件的哈希核验及缺失/损坏测试。
- medium / patch：core 被合法 TOML 标量覆盖后 `.get()` 异常；增加类型检查与回归用例，返回结构化失败。
- medium / patch：安装版本可能被其他节点的同名字段误匹配；限定 installation 段并测试无关版本匹配。
- low / patch：空引号描述会通过检查；增加非空验证与用例。
