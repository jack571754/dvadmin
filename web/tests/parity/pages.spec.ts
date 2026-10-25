import { test, expect } from '../i18n/fixtures/auth';

const pages = [
  ['/user', '/api/system/user/', '.el-table'], ['/role', '/api/system/role/', '.el-table'],
  ['/menu', '/api/system/menu/', '.el-tree'], ['/dept', '/api/system/dept/', '.el-tree'],
  ['/messageCenter', '/api/system/message_center/', '.el-table'], ['/apiWhiteList', '/api/system/api_white_list/', '.el-table'],
  ['/downloadCenter', '/api/system/download_center/', '.el-table'], ['/config', '/api/system/system_config/', '.buttons-group'],
  ['/dictionary', '/api/system/dictionary/', '.el-table'], ['/areas', '/api/system/area/', '.el-table'],
  ['/file', '/api/system/file/', '.el-table'], ['/loginLog', '/api/system/login_log/', '.el-table'],
  ['/operationLog', '/api/system/operation_log/', '.el-table'], ['/taskManage', '/api/dvadmin_celery/task/', '.el-table'],
  ['/taskLog', '/api/dvadmin_celery/task_detail/', '.el-table'],
  ['/flowManagement', '/api/dvadmin3_flow/flow_info/', '.el-table'],
  ['/flowList', '/api/dvadmin3_flow/flow_info/flow_list/', '.el-empty, .el-card'],
  ['/flowData', '/api/dvadmin3_flow/flow_data/get_all_flow_data/', '.el-table'],
  ['/flowTodo', '/api/dvadmin3_flow/flow_data/handle_to_me/', '.el-table'],
  ['/flowIdo', '/api/dvadmin3_flow/flow_data/handle_completed/', '.el-table'],
  ['/flowSubmitted', '/api/dvadmin3_flow/flow_data/handle_my_submit/', '.el-table'],
  ['/flowCC', '/api/dvadmin3_flow/flow_data/cc_to_me/', '.el-table'],
  ['/personal', '/api/system/user/user_info/', '.el-form'],
] as const;

for (const [path, api, selector] of pages) {
  test(`${path}: retained entry renders and its real read API succeeds`, async ({ authenticatedPage }, info) => {
    const { page } = authenticatedPage;
    const errors: string[] = [], failures: string[] = [];
    const responses: Promise<void>[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      const url = new URL(response.url());
      if (!url.pathname.startsWith('/api/')) return;
      responses.push((async () => {
        if (!response.ok()) { failures.push(`${response.status()} ${url.pathname}`); return; }
        if (!response.headers()['content-type']?.includes('json')) return;
        const body = await response.json().catch(() => undefined);
        if (body?.code && ![2000, 200, '2000', '200'].includes(body.code)) failures.push(`${body.code} ${url.pathname}: ${body.msg}`);
      })());
    });
    await page.setViewportSize({ width: 1440, height: 960 });
    const request = page.waitForResponse(response => new URL(response.url()).pathname === api && response.request().method() === 'GET');
    await page.goto(`/#${path}`);
    expect((await (await request).json()).code).toBe(2000);
    await expect(page.locator(selector).first()).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`#${path}$`));
    await page.waitForTimeout(250);
    await Promise.all(responses);
    await info.attach('parity-read-check', { contentType: 'application/json', body: JSON.stringify({ path, api, errors, failures }) });
    expect(errors).toEqual([]); expect(failures).toEqual([]);
  });
}
