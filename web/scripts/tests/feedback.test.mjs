import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeedback } from '../../src/shared/ui/feedbackCore.ts';

function fixture() {
  const calls = [];
  let clock = 0;
  const emit = {
    toast: options => calls.push({ channel: 'toast', ...options }),
    notification: options => calls.push({ channel: 'notification', ...options }),
    dialog: options => { calls.push({ channel: 'dialog', ...options }); return Promise.resolve(true); },
  };
  const translate = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key);
  const api = createFeedback(emit, translate, () => clock);
  return { ...api, calls, tick: ms => { clock += ms; } };
}

test('中文文案直通，英文走翻译函数', () => {
  const f = fixture();
  f.feedback({ level: 'toast', tone: 'success', message: '保存成功' });
  f.feedback({ level: 'toast', tone: 'success', message: 'common.saved' });
  f.feedback({ level: 'toast', tone: 'success', message: 'common.deleted', params: { name: '角色' } });
  assert.deepEqual(f.calls.map(call => call.message), ['保存成功', 'common.saved', 'common.deleted:{"name":"角色"}']);
});

test('toast 与 notification 使用各自的默认时长', () => {
  const f = fixture();
  f.feedback({ level: 'toast', message: 'ok' });
  f.feedback({ level: 'notification', message: 'ok' });
  assert.equal(f.calls[0].duration, 2000);
  assert.equal(f.calls[1].duration, 4500);
});

test('相同 dedupeKey 在窗口内只响一次，窗口过后可再响', () => {
  const f = fixture();
  f.feedback({ level: 'toast', tone: 'error', message: 'network', dedupeKey: 'http:network' });
  f.feedback({ level: 'toast', tone: 'error', message: 'network', dedupeKey: 'http:network' });
  assert.equal(f.calls.length, 1);
  f.tick(1500);
  f.feedback({ level: 'toast', tone: 'error', message: 'network', dedupeKey: 'http:network' });
  assert.equal(f.calls.length, 2);
});

test('不同 dedupeKey 互不影响', () => {
  const f = fixture();
  f.feedback({ level: 'toast', message: 'a', dedupeKey: 'http:network' });
  f.feedback({ level: 'toast', message: 'b', dedupeKey: 'http:server' });
  assert.equal(f.calls.length, 2);
});

test('inline 档不由门面派发（属组件内状态）', () => {
  const f = fixture();
  f.feedback({ level: 'inline', message: '字段错误' });
  assert.equal(f.calls.length, 0);
});

test('dialog 档返回确认结果，并带上按钮文案', async () => {
  const f = fixture();
  const confirmed = await f.feedback({ level: 'dialog', tone: 'warning', message: '删除「角色A」？', confirmText: '删除', cancelText: '取消' });
  assert.equal(confirmed, true);
  assert.equal(f.calls[0].channel, 'dialog');
  assert.equal(f.calls[0].confirmText, '删除');
  assert.equal(f.calls[0].cancelText, '取消');
});

test('text 优先于 message 原样输出', () => {
  const f = fixture();
  f.feedback({ level: 'toast', text: '超时，请重试', message: 'common.timeout' });
  assert.equal(f.calls[0].message, '超时，请重试');
});

test('长时 toast 可要求关闭按钮，默认不带', () => {
  const f = fixture();
  f.feedback({ level: 'toast', message: '已应用到 12 个商品', duration: 6000, showClose: true });
  f.feedback({ level: 'toast', message: 'ok' });
  assert.equal(f.calls[0].showClose, true);
  assert.equal(f.calls[0].duration, 6000);
  assert.equal(f.calls[1].showClose, undefined);
});
