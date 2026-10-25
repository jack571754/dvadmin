# 本次改动范围

只审查本次删除下拉菜单项焦点细线的差异。工作树里其他大量未提交改动属于此前工作。

文件：`web/src/theme/skin/popper.scss`

```diff
-/* Dropdown hover moves focus as well. Keep its focus treatment inside the item,
-   instead of inheriting the shell's outer ring (which is clipped by the popup). */
+/* 菜单项在悬浮与键盘聚焦时统一使用背景高亮，不额外绘制焦点边框。 */
 .el-dropdown-menu .el-dropdown-menu__item {
   &:focus,
   &:focus-visible {
     outline: none;
     outline-offset: 0;
+    box-shadow: none;
   }

   &:not(.is-disabled):focus {
     background-color: var(--admin-hover) !important;
     color: var(--admin-text) !important;
   }
-
-  &:not(.is-disabled):focus-visible:not(:hover) {
-    box-shadow: inset 0 0 0 1px var(--admin-border-strong);
-  }
 }
+
+/* 键盘切换焦点后，停留在旧位置的鼠标不应让另一项同时高亮。 */
+.el-dropdown-menu:focus-within .el-dropdown-menu__item:not(:focus):hover {
+  background-color: transparent !important;
+}
```
