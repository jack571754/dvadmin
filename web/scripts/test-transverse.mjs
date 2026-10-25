import { chromium } from "playwright";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkzMDI1NTI1LCJpYXQiOjE3OTI5MzkxMjUsImp0aSI6ImNhMmUyMTZkNjIzMTQ5ZWFhNzY5MmUwMjhhYWI5MzBhIiwidXNlcl9pZCI6IjEifQ.tm96oiEEex7RAVo-3NFcEmHXtK2p4CdztNUxh7TETdo";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message, err.stack));

  await page.addInitScript(({ access }) => {
    localStorage.setItem("token", access);
    localStorage.setItem("themeConfigVersion", JSON.stringify("1.0.0"));
  }, { access: token });

  await page.goto("http://127.0.0.1:8200/#/home");
  await page.waitForTimeout(3000);

  console.log("Clicking skin button...");
  await page.click(".icon-skin");
  await page.waitForTimeout(1000);

  console.log("Looking for layout drawer items...");
  const items = page.locator(".layout-drawer-content-item");
  const count = await items.count();
  console.log("Drawer items count:", count);

  if (count >= 2) {
    console.log("Clicking transverse item...");
    await items.nth(1).click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: "C:/Users/Administrator/.gemini/antigravity/brain/2dfc6b30-a797-43a9-9c08-dd1bdb56d66e/after-click-transverse.png" });

  const navInfo = await page.evaluate(() => {
    const aside = document.querySelector(".el-aside");
    const horizontal = document.querySelector(".el-menu-horizontal-warp");
    const menuItems = Array.from(document.querySelectorAll(".el-menu--horizontal .el-menu-item, .el-menu--horizontal .el-sub-menu")).map(el => el.textContent.trim());
    const layoutEl = document.querySelector(".layout-container");
    const storedConfig = localStorage.getItem("themeConfig");
    return {
      layoutClasses: layoutEl?.className,
      hasAside: !!aside,
      asideWidth: aside ? window.getComputedStyle(aside).width : null,
      hasHorizontal: !!horizontal,
      menuItemsCount: menuItems.length,
      menuItems: menuItems,
      storedLayout: JSON.parse(storedConfig || "{}").layout
    };
  });
  console.log("NAV INFO:", JSON.stringify(navInfo, null, 2));
  await browser.close();
})();
