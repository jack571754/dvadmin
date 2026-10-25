/** Development-only component fixture; mounts the shipped settings without accessing business data. */
import { createApp, defineComponent, h, ref, watch } from 'vue';
import ElementPlus, { ElButton, ElMenu, ElMenuItem, ElSubMenu, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '/@/theme/index.scss';
import pinia from '/@/stores';
import { useThemeConfig } from '/@/stores/themeConfig';
import { i18n } from '/@/i18n';
import Settings from '/@/layout/navBars/breadcrumb/setings.vue';
import { migrateThemeConfig } from '/@/shared/access/preferences';
import { applyTheme } from '/@/shared/access/theme';
import { Local } from '/@/utils/storage';
import other from '/@/utils/other';
import SvgIcon from '/@/components/svgIcon/index.vue';

const store = useThemeConfig(pinia);
const stored = migrateThemeConfig(localStorage, store.themeConfig);
if (stored) store.themeConfig = stored;
applyTheme(store.themeConfig);
watch(() => store.themeConfig, config => {
  applyTheme(config);
  Local.set('themeConfig', config);
}, { deep: true });

const Fixture = defineComponent({
  setup() {
    const settings = ref();
    const collapsed = ref(true);
    return () => h('main', { class: 'layout-modern', style: 'padding:24px;color:var(--admin-text);background:var(--admin-canvas);min-height:100%;' }, [
      h('h1', { style: 'font-size:20px;margin-bottom:8px;' }, '主题组件验证'),
      h('p', { style: 'color:var(--admin-muted);margin-bottom:24px;' }, '实际界面配置组件 · 不读取业务数据'),
      h(ElButton, { onClick: () => settings.value?.openDrawer() }, () => '打开界面配置'),
      h(ElButton, { type: 'primary', style: 'margin-left:12px;' }, () => '主要操作'),
      h(ElButton, { style: 'margin-left:12px;', onClick: () => { collapsed.value = !collapsed.value; } }, () => collapsed.value ? '展开侧栏' : '折叠侧栏'),
      h(ElDropdown, { style: 'margin-left:12px;' }, {
        default: () => h(ElButton, {}, () => '账户菜单'),
        dropdown: () => h(ElDropdownMenu, {}, () => [
          h(ElDropdownItem, { command: 'home' }, () => '首页'),
          h(ElDropdownItem, { command: 'personal' }, () => '个人中心'),
          h(ElDropdownItem, { command: 'version' }, () => '版本升级日志'),
          h(ElDropdownItem, { command: 'logout', divided: true }, () => '退出登录'),
        ]),
      }),
      h('section', { style: 'padding:24px;margin-top:24px;border:1px solid var(--admin-border);border-radius:var(--admin-radius);background:var(--admin-surface);' }, [
        h('h2', { style: 'font-size:14px;margin-bottom:16px;' }, '基础配置'),
        h('input', { value: 'DVAdmin', 'aria-label': '系统名称', style: 'background:var(--admin-surface);color:var(--admin-text);padding:8px;border:1px solid var(--admin-input);border-radius:var(--admin-radius-sm);' }),
        ...['success', 'warning', 'danger'].map((type, index) => h('span', { class: `el-tag el-tag--${type}`, style: 'margin-left:12px;' }, ['已启用', '待处理', '已停用'][index])),
      ]),
      h('div', { class: 'layout-modern', style: 'display:flex;height:auto;margin-top:24px;' }, [
        h('aside', { class: ['layout-aside', collapsed.value ? 'layout-aside-pc-70' : 'layout-aside-pc-228'] }, [
          h(ElMenu, { defaultActive: 'home', collapse: collapsed.value, collapseTransition: false }, () => [
            h(ElMenuItem, { index: 'home' }, { default: () => h(SvgIcon, { name: 'ele-House' }), title: () => '首页' }),
            h(ElSubMenu, { index: 'system' }, {
              title: () => [h(SvgIcon, { name: 'ele-Setting' }), h('span', '系统管理')],
              default: () => h(ElMenuItem, { index: 'users' }, () => '用户管理'),
            }),
            h(ElSubMenu, { index: 'files' }, {
              title: () => [h(SvgIcon, { name: 'ele-Files' }), h('span', '资源管理')],
              default: () => h(ElMenuItem, { index: 'attachments' }, () => '附件管理'),
            }),
          ]),
        ]),
        h('div', { class: 'layout-container-view', style: 'min-height:120px;padding:24px;flex:1;' }, '工作区表面与导航选中态'),
      ]),
      h(Settings, { ref: settings }),
    ]);
  },
});
const app = createApp(Fixture);
app.use(pinia).use(i18n).use(ElementPlus);
other.elSvg(app);
app.mount('#app');
