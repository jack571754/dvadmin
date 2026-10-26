import { createHash } from 'node:crypto';
import { test, expect } from '../i18n/fixtures/auth';

const pages = [
  ['/product_archive', 'product_archives'],
  ['/design_workorder_archive', 'stores'],
  ['/product_spec_submission', 'product_spec_submissions'],
  ['/spec_template', 'spec_templates'],
  ['/icon_library', 'icons'],
] as const;

test('six restored design order pages use real isolated APIs and render the editor', async ({ authenticatedPage }) => {
  test.setTimeout(180_000);
  const { page } = authenticatedPage;
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const [path, resource] of pages) {
    const response = page.waitForResponse(response => new URL(response.url()).pathname === `/api/design_order/${resource}/`);
    await page.goto(`/#${path}`);
    expect((await response).ok()).toBeTruthy();
    expect((await (await response).json()).code).toBe(2000);
    await expect(page.locator('.el-table')).toBeVisible();
    await page.screenshot({ path: `../_bmad-output/implementation-artifacts/design-order-${resource}.png`, animations: 'disabled' });
  }
  const schema = page.waitForResponse(response => response.url().includes('/api/design_order/spec_templates/schema/'));
  await page.goto('/#/product_spec');
  expect((await (await schema).json()).code).toBe(2000);
  await expect(page.locator('#univer-container canvas:visible').first()).toBeVisible({ timeout: 60_000 });
  await page.screenshot({ path: "../_bmad-output/implementation-artifacts/design-order-editor.png", animations: "disabled" });
  expect(errors).toEqual([]);
});

test('system user page retains login and exposes platform grants', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#/user');
  await expect(page.locator('.el-table')).toBeVisible();
  await page.getByRole('button', { name: '平台权限', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByText('京东', { exact: true })).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('button', { name: '保存', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('share URL opens anonymously and reports invalid code without login redirect', async ({ page }) => {
  await page.goto('/#/share/product-spec/unknown-restoration-code');
  await expect(page).toHaveURL(/#\/share\/product-spec\/unknown-restoration-code/);
  await expect(page.getByText(/分享.*不存在|分享.*失效|无效.*分享/).first()).toBeVisible();
});


test('an authenticated share creation renders an existing snapshot anonymously', async ({ page, request }) => {
  const login = await request.post(`${process.env.API_BASE_URL}/api/login/`, { data: {
    username: process.env.TEST_ADMIN_USER || 'e2e_admin',
    password: createHash('md5').update(process.env.TEST_ADMIN_PASSWORD || 'E2eOnly-ChangeMe123!').digest('hex'),
  } });
  const token = (await login.json()).data.access;
  const headers = { Authorization: `JWT ${token}` };
  const snapshot = { id: 'restore-share-book', name: '恢复验证', sheetOrder: ['sheet1'], styles: {}, sheets: {
    sheet1: { id: 'sheet1', name: '规格书', rowCount: 30, columnCount: 8, cellData: {
      0: { 0: { v: '恢复验证配置' }, 1: { v: '商品提报 1' } }, 2: { 1: { v: '恢复验证产品' } },
    } },
  } };
  const submission = await request.post(`${process.env.API_BASE_URL}/api/design_order/product_archives/save_spec/`, {
    headers, data: { name: 'E2E 恢复历史分享', platform: '京东', shop: 'E2E 店铺', status: 'draft', snapshot, products: [{ nickname: '恢复验证产品' }] },
  });
  const result = await submission.json();
  expect(result.code).toBe(2000);
  const id = result.data.id;
  try {
    const response = await request.post(`${process.env.API_BASE_URL}/api/design_order/product_spec_shares/`, { headers, data: { submission_id: id } });
    const share = await response.json();
    expect(share.code).toBe(2000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/#/share/product-spec/${share.data.shareCode}`);
    await expect(page.getByRole('heading', { name: 'E2E 恢复历史分享' })).toBeVisible();
    await expect(page.locator('#share-univer-container canvas:visible').first()).toBeVisible();
    await page.screenshot({ path: '../_bmad-output/implementation-artifacts/design-order-share.png', animations: 'disabled' });
    expect(errors).toEqual([]);
  } finally {
    await request.delete(`${process.env.API_BASE_URL}/api/design_order/product_spec_submissions/${id}/`, { headers });
  }
});
