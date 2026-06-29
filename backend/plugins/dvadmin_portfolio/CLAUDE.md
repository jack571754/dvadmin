[根目录](../../../CLAUDE.md) > [backend](../../CLAUDE.md) > [plugins](../) > **dvadmin_portfolio**

# Dvadmin Portfolio 模块文档

> 最后更新：2026-06-17 15:46:52

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-06-17 15:46:52 | 增量更新：补全 PortfolioItem.category 三种作品类别、刷新接口认证矩阵、确认 fixtures/initialize.py 缺口 |
| 2026-06-11 18:44:26 | 初始化模块文档 |

---

## 模块职责

个人履历与作品集展示插件，提供：
- 个人信息配置（姓名、头像、职业头衔、简介、邮箱）
- 履历时间线管理（职位、公司、成就列表）
- 作品项目管理（案例/文章/实验，含预览图、演示链接、源码链接、成果标签）
- 公开展示接口（免登录访问，用于前端作品集页面）

---

## 入口与启动

- **Apps 配置**：`apps.py` -- name = `dvadmin_portfolio`
- **URL 路由**：`urls.py` -- 前缀 `/api/portfolio/`
- **注册方式**：通过 `settings.py` 中 `from dvadmin_portfolio.settings import *` 自动注册（在 `application/settings.py:444` 处导入）
- **前端页面**：`web/src/views/portfolio/index.vue`（公开页）、`web/src/views/plugins/dvadmin_portfolio/`（管理页）

---

## 对外接口

| 路由后缀 | ViewSet/View | 认证 | 说明 |
|----------|-------------|------|------|
| `config/` | PortfolioConfigViewSet | 需认证 | 个人配置 CRUD |
| `resume/` | ResumeTimelineViewSet | 需认证 | 履历时间线 CRUD |
| `item/` | PortfolioItemViewSet | 需认证 | 作品项目 CRUD |
| `public/` | PortfolioPublicView | 免登录 | 公开展示接口（GET） |

### 公开接口返回结构

```json
{
  "config": {
    "name": "...",
    "avatar": "...",
    "hero_title": "...",
    "hero_role": "...",
    "hero_bio": "...",
    "email": "...",
    "social_proof": "..."
  },
  "timeline": [
    {
      "role": "...",
      "company": "...",
      "start_date": "...",
      "end_date": "...",
      "summary": "...",
      "achievements": ["..."]
    }
  ],
  "items": [
    {
      "title": "...",
      "category": "case-study",
      "image": "...",
      "demo_url": "...",
      "git_url": "...",
      "result_tag": "..."
    }
  ]
}
```

---

## 关键依赖与配置

- 继承 `CoreModel`
- 视图集继承 `CustomModelViewSet`
- 插件自动注册：`settings.py` 将自身添加到 INSTALLED_APPS 和 PLUGINS_URL_PATTERNS
- 租户模式：`tenant_exclusive_apps = ['dvadmin_portfolio']`
- 表前缀：`portfolio_`

---

## 数据模型

| 模型 | 核心字段 | 说明 |
|------|----------|------|
| PortfolioConfig | name, avatar, hero_title, hero_role, hero_bio, email, social_proof, is_active | 个人配置 |
| ResumeTimeline | role, company, start_date, end_date, summary, achievements(JSON), sort | 履历时间线 |
| PortfolioItem | title, category(case-study/essay/experiment), summary, content, image, demo_url, git_url, result_tag, sort, is_recommend | 作品项目 |

### 作品类别

| 值 | 显示名 |
|----|--------|
| case-study | 精选案例 |
| essay | 深度思考 (Blog) |
| experiment | 代码实验 |

---

## 测试与质量

- 无自动化测试
- **缺口**（优先级低）：
  - `PortfolioPublicView` 公开接口需确认不泄露敏感数据（如未发布草稿）
  - `fixtures/initialize.py` 初始化数据需读取确认默认配置

---

## 常见问题 (FAQ)

**Q: 如何设置当前启用的个人配置？**
A: `PortfolioConfig.is_active = True`，公开接口会优先返回 `is_active=True` 的配置。

**Q: 前端作品集页面如何访问？**
A: 前端路由 `/portfolio` 为免登录白名单页面，直接渲染 `web/src/views/portfolio/index.vue`。

**Q: 公开接口是否会泄露草稿？**
A: 公开接口应仅返回 `is_recommend=True` 或已发布的作品，需在 `PortfolioPublicView` 中确认过滤逻辑。

---

## 相关文件清单

```
backend/plugins/dvadmin_portfolio/
  __init__.py
  apps.py
  models.py              # 3 个模型
  views.py               # 4 个视图（3 ViewSet + 1 PublicView）
  serializers.py         # 3 个序列化器
  urls.py                # 路由配置
  settings.py            # 插件自动注册配置
  fixtures/
    initialize.py        # 初始化数据（未读取，缺口）
  migrations/
    0001_initial.py
    0002_initial.py
```
