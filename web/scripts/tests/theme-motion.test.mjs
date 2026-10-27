import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

// 编译真实主题入口，断言的是最终产物而不是源文件字面量。
const entry = fileURLToPath(new URL('../../src/theme/index.scss', import.meta.url));
const { css } = sass.compile(entry, { loadPaths: [fileURLToPath(new URL('../../src', import.meta.url))], style: 'expanded' });

function tokenValue(name) {
  const match = new RegExp(`--${name}\\s*:\\s*([^;]+);`).exec(css);
  return match ? match[1].trim() : null;
}

function reducedMotionBlock() {
  const start = css.indexOf('@media (prefers-reduced-motion: reduce)');
  assert.notEqual(start, -1, '主题产物里没有 prefers-reduced-motion 降级块');
  let depth = 0;
  for (let index = css.indexOf('{', start); index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(start, index + 1);
    }
  }
  return css.slice(start);
}

test('motion tokens are published on :root with fixed values', () => {
  assert.equal(tokenValue('admin-duration-fast'), '120ms');
  assert.equal(tokenValue('admin-duration-base'), '180ms');
  assert.equal(tokenValue('admin-duration-slow'), '220ms');
  assert.match(tokenValue('admin-ease-standard') ?? '', /^cubic-bezier\(/);
  assert.match(tokenValue('admin-ease-out') ?? '', /^cubic-bezier\(/);
});

test('app-level transitions consume the duration tokens instead of literals', () => {
  for (const name of ['fade', 'slide-right', 'slide-left', 'opacitys']) {
    const rule = new RegExp(`\\.${name}-enter-active[^{]*\\{[^}]*\\}`).exec(css);
    assert.ok(rule, `.${name}-enter-active 规则缺失`);
    assert.match(rule[0], /var\(--admin-duration(?:-fast|-base|-slow)?\)/, `.${name} 没有使用时长令牌`);
  }
  const breadcrumb = /\.breadcrumb-enter-active[^{]*\{[^}]*\}/.exec(css);
  assert.ok(breadcrumb, '.breadcrumb-enter-active 规则缺失');
  assert.match(breadcrumb[0], /var\(--admin-duration-slow\)/);
});

test('reduced-motion falls back to 1ms without a universal selector', () => {
  const block = reducedMotionBlock();
  assert.match(block, /\.fade-enter-active/, '降级块没有覆盖页面切换过渡');
  assert.match(block, /\.breadcrumb-enter-active/, '降级块没有覆盖面包屑过渡');
  assert.match(block, /--el-transition-duration\s*:\s*1ms/, '没有把 Element 过渡压到 1ms');
  assert.doesNotMatch(block, /\*\s*\{/, '降级块不应使用通配选择器');
  assert.doesNotMatch(block, /transition\s*:\s*none/, '不能用 transition:none（过渡事件不再触发）');
});

test('reduced-motion also stops the infinite decorative animations', () => {
  // 只压过渡会留下无限循环的动画（外链页流光、加载方块、Element spinner），
  // 那是 reduced-motion 用户最先要关掉的东西。
  const block = reducedMotionBlock();
  for (const selector of ['.layout-link-icon::after', '.loading-next-box-item', '.el-icon.is-loading', '.el-loading-spinner .circular', '.text-container:hover']) {
    assert.ok(block.includes(selector), `降级块没有关掉 ${selector} 的动画`);
  }
  assert.match(block, /animation\s*:\s*none\s*!important/, '无限动画应直接关闭');
});
