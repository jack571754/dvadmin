import { test, expect } from '../i18n/fixtures/auth';
import type { Page } from '@playwright/test';
const failures = new Map<string, string[]>();
test.beforeEach(({ page }, info) => { const errors: string[] = []; failures.set(info.testId, errors); page.on('pageerror', error => errors.push(error.message)); });
test.afterEach(({ page: _page }, info) => { expect(failures.get(info.testId)).toEqual([]); failures.delete(info.testId); });
async function open(page: Page) {
  await page.setViewportSize({ width: 1600, height: 1000 }); await page.goto('/#/user');
  await expect(page.locator('.el-table').first()).toBeVisible();
}
test('closing a changed user form requires an explicit discard', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage; await open(page);
  await page.locator('.fs-actionbar').getByRole('button', { name: '新增', exact: true }).click();
  const dialog = page.getByRole('dialog').filter({ has: page.getByPlaceholder('请输入账号', { exact: true }) });
  await dialog.getByPlaceholder('请输入账号', { exact: true }).fill('keep_this_draft');
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  const modal = page.locator('.el-message-box');
  await expect(modal).toContainText('表单内容尚未保存');
  await modal.getByRole('button', { name: '继续编辑', exact: true }).click();
  await expect(dialog.getByPlaceholder('请输入账号', { exact: true })).toHaveValue('keep_this_draft');
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  await modal.getByRole('button', { name: '放弃修改', exact: true }).click();
  await expect(dialog).not.toBeVisible();
});
for (const operation of ['delete', 'reset']) {
  test(`${operation}: cancellation is quiet, pending requests deduplicate and failed operations can retry`, async ({ authenticatedPage }) => {
    const { page } = authenticatedPage; await open(page);
    const name = operation === 'delete' ? '删除' : '重置密码';
    const button = page.getByRole('button', { name, exact: true }).first();
    const modal = page.locator('.el-message-box');
    let writes = 0, release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route(operation === 'delete' ? '**/api/system/user/*/' : '**/api/system/user/*/reset_to_default_password/', async route => {
      if (route.request().method() !== (operation === 'delete' ? 'DELETE' : 'PUT')) return route.fallback();
      writes++; if (writes === 1) await gate;
      return route.fulfill({ json: writes === 1 ? { code: 4000, msg: '操作失败，请重试' } : { code: 2000, msg: '操作成功' } });
    });
    await button.click(); await modal.getByRole('button', { name: '取消', exact: true }).click();
    expect(writes).toBe(0); await expect(button).toBeEnabled();
    await button.click(); await modal.getByRole('button', { name: '确定', exact: true }).click();
    await expect(button).toBeDisabled(); await button.dispatchEvent('click'); expect(writes).toBe(1);
    release(); await expect(button).toBeEnabled();
    await expect(page.getByText('操作失败，请重试', { exact: true })).toBeVisible();
    await button.click(); await modal.getByRole('button', { name: '确定', exact: true }).click();
    await expect.poll(() => writes).toBe(2);
  });
}
test('permission revoked while deletion is being confirmed prevents the write', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage; await open(page); let writes = 0;
  page.on('request', request => { if (request.method() === 'DELETE') writes++; });
  await page.getByRole('button', { name: '删除', exact: true }).first().click();
  await page.route('**/api/system/menu_button/menu_button_all_permission/**', route => route.fulfill({ json: { code: 2000, data: ['user:Search'] } }));
  await page.evaluate(async () => { const path = '/src/stores/btnPermission.ts'; await (await import(path)).BtnPermissionStore().getBtnPermissionStore(); });
  await page.locator('.el-message-box').getByRole('button', { name: '确定', exact: true }).click();
  expect(writes).toBe(0); await expect(page.getByRole('button', { name: '删除', exact: true })).toHaveCount(0);
});
test('export uses current filters and an asynchronous response links to Download Center', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage; await open(page);
  await page.getByPlaceholder('搜索姓名或账号', { exact: true }).fill('e2e_reader');
  await page.getByPlaceholder('搜索姓名或账号', { exact: true }).press('Enter');
  let query: URL | undefined, downloads = 0;
  page.on('download', () => { downloads++; });
  await page.route('**/api/system/user/export_data/**', route => {
    query = new URL(route.request().url()); return route.fulfill({ json: { code: 2000, msg: 'task created', data: [] } });
  });
  await page.getByRole('button', { name: '导出', exact: true }).click();
  await page.locator('.el-message-box').getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByRole('link', { name: '打开下载中心', exact: true })).toBeVisible();
  expect(query?.searchParams.get('search')).toBe('e2e_reader'); expect(downloads).toBe(0);
});
test('import retains the file on failure, blocks duplicate posts and reuses its uploaded URL on retry', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage; await open(page);
  let uploads = 0, imports = 0, release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/system/file/', route => {
    uploads++; expect(route.request().headers()['content-type']).toContain('multipart/form-data');
    return route.fulfill({ json: { code: 2000, data: { url: '/media/e2e-probe.xlsx' } } });
  });
  await page.route('**/api/system/user/import_data/', async route => {
    if (route.request().method() !== 'POST') return route.fallback();
    imports++; expect(route.request().postDataJSON()).toEqual({ url: '/media/e2e-probe.xlsx' });
    if (imports === 1) await gate;
    return route.fulfill({ json: imports === 1 ? { code: 4000, msg: '文件校验失败' } : { code: 2000, msg: '导入成功' } });
  });
  await page.getByRole('button', { name: '导入', exact: true }).click();
  const dialog = page.getByRole('dialog').filter({ has: page.locator('#user-import-file') });
  const file = dialog.locator('input[type=file]');
  await file.setInputFiles({ name: 'probe.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from('mocked only') });
  const submit = dialog.getByRole('button', { name: '确定', exact: true });
  await submit.click(); await expect(submit).toBeDisabled(); await submit.dispatchEvent('click');
  await expect.poll(() => imports).toBe(1); release();
  await expect(dialog.getByRole('alert')).toContainText('文件校验失败');
  expect(await file.evaluate(element => (element as HTMLInputElement).files?.[0].name)).toBe('probe.xlsx');
  await submit.click(); await expect(dialog).not.toBeVisible();
  expect(uploads).toBe(1); expect(imports).toBe(2);
});
