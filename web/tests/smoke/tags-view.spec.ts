import { test, expect } from '../i18n/fixtures/auth';

test('each closable tab renders one close control and keeps the previous page when closed', async ({ authenticatedPage }) => {
  const { page } = authenticatedPage;
  await page.goto('/#/user');
  await expect(page.locator('.el-table')).toBeVisible();
  await page.goto('/#/dictionary');
  await expect(page.locator('.el-table')).toBeVisible();

  const active = page.locator('.layout-navbars-tagsview-ul-li.is-active');
  await expect(active).toContainText('字典管理');
  await expect(active.locator('.layout-navbars-tagsview-ul-li-icon')).toHaveCount(1);
  await expect(active.locator('.layout-navbars-tagsview-ul-li-refresh')).toHaveCount(1);
  for (const style of ['tags-style-shadcn', 'tags-style-one', 'tags-style-four', 'tags-style-five']) {
    await page.evaluate(async tagsStyle => {
      const { useThemeConfig } = await import('/src/stores/themeConfig.ts');
      useThemeConfig().themeConfig.tagsStyle = tagsStyle;
    }, style);
    await expect(active.locator('.layout-navbars-tagsview-ul-li-icon')).toHaveCount(1);
    await expect(active.locator('.layout-navbars-tagsview-ul-li-icon')).toBeVisible();
  }

  const previous = page.locator('.layout-navbars-tagsview-ul-li').filter({ hasText: '用户管理' });
  await expect(previous.locator('.layout-navbars-tagsview-ul-li-icon')).toHaveCount(1);
  const home = page.locator('.layout-navbars-tagsview-ul-li').filter({ hasText: '首页' });
  await expect(home.locator('.layout-navbars-tagsview-ul-li-icon')).toHaveCount(0);

  await active.locator('.layout-navbars-tagsview-ul-li-icon').click();
  await expect(page).toHaveURL(/#\/user/);
  await expect(page.locator('.el-table')).toBeVisible();
});
