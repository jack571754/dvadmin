---
title: '下拉菜单仅使用背景高亮'
type: 'chore'
created: '2026-10-25'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="用户明确要求移除菜单项边框，只保留背景色">

## Intent

移除下拉菜单项的焦点描边和内侧细线。鼠标悬浮、键盘方向键导航均只显示现有背景色高亮，菜单操作保持可用。

</frozen-after-approval>

## Implementation Notes

- 意图无缺口，无不可逆操作；仅修改菜单项样式，不改菜单命令和其他未提交工作。
- `web/src/theme/skin/popper.scss`：删除键盘焦点的 1px 内侧描边，聚焦时显式清除阴影，复用原有背景高亮。
- 按用户项目约定保留未提交改动，不执行提交、推送或部署。
- 独立审查发现鼠标停留在旧项目时，方向键移动焦点会出现两项同时高亮；浏览器已复现，增加仅在菜单含焦点时取消非焦点项悬浮背景的规则。
- 验证：SCSS 编译及本次文件的空白检查通过；浏览器中鼠标悬浮与键盘聚焦的 outline、box-shadow 均为 none，项目边框宽度为 0px；混合输入时只有焦点项保留背景。

## Review Triage Log

- low，已修复：审查指出取消内侧细线后，鼠标停在 A、键盘焦点移至 B 会同时显示两项背景。已在实际组件复现；增加 focus-within 范围规则取消非焦点悬浮项的背景，浏览器验证旧项目透明、当前焦点项目高亮。
