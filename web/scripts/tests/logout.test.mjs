import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOGOUT_REDIRECT, runLogout } from '../../src/shared/access/logoutCore.ts';

function createDeps(events = []) {
	return {
		events,
		clearSession: () => events.push('clear'),
		replaceRoute: async (path) => {
			events.push(`replace:${path}`);
			return true;
		},
		notify: (key) => events.push(`notify:${key}`),
		hardRedirect: (path) => events.push(`hard:${path}`),
	};
}

test('退出登录只有一条路径：清会话 → 跳登录页 → 提示一次', async () => {
	const deps = createDeps();
	await runLogout(deps);
	assert.deepEqual(deps.events, ['clear', 'replace:/login', 'notify:message.common.logoutSuccess']);
});

test('跳转目标是登录页常量，两个入口不会各自写死', () => {
	assert.equal(LOGOUT_REDIRECT, '/login');
});

test('清会话在跳转之前完成，避免登录页带着旧 token 初始化', async () => {
	const deps = createDeps();
	await runLogout(deps);
	assert.ok(deps.events.indexOf('clear') < deps.events.indexOf('replace:/login'));
});

test('跳转失败时异常向上抛，但会话已经清干净', async () => {
	const events = [];
	const deps = {
		...createDeps(events),
		replaceRoute: async () => {
			throw new Error('navigation aborted');
		},
	};
	await assert.rejects(() => runLogout(deps));
	assert.ok(events.includes('clear'));
});

test('软跳转被路由守卫取消时改整页跳转，不谎报退出成功', async () => {
	// router.replace 被守卫取消是 resolve 一个 NavigationFailure，不是 reject；
	// 若把它当成成功，就会出现"会话已清空、页面还停在编辑器、却提示退出成功"。
	const events = [];
	const deps = { ...createDeps(events), replaceRoute: async () => false };
	await runLogout(deps);
	assert.ok(events.includes('hard:/login'), '没有兜底整页跳转');
	assert.ok(!events.some((event) => event.startsWith('notify:')), '导航没走成却提示了成功');
});

test('有兜底整页跳转时，会话仍然先清干净', async () => {
	const events = [];
	const deps = { ...createDeps(events), replaceRoute: async () => false };
	await runLogout(deps);
	assert.ok(events.indexOf('clear') === 0);
});
