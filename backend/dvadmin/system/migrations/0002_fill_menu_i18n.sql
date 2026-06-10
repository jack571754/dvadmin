-- 填充菜单名称的多语言翻译
-- 执行: python manage.py dbshell < dvadmin/system/migrations/0002_fill_menu_i18n.sql

UPDATE dvadmin_system_menu
SET
    name_en = CASE name
        WHEN '系统管理' THEN 'System Management'
        WHEN '用户管理' THEN 'User Management'
        WHEN '菜单管理' THEN 'Menu Management'
        WHEN '部门管理' THEN 'Department Management'
        WHEN '角色管理' THEN 'Role Management'
        WHEN '消息中心' THEN 'Notification Center'
        WHEN '接口白名单' THEN 'API Whitelist'
        WHEN '下载中心' THEN 'Download Center'
        WHEN '常规配置' THEN 'General Config'
        WHEN '系统配置' THEN 'System Config'
        WHEN '字典管理' THEN 'Dictionary Management'
        WHEN '地区管理' THEN 'Area Management'
        WHEN '附件管理' THEN 'File Management'
        WHEN '日志管理' THEN 'Log Management'
        WHEN '登录日志' THEN 'Login Logs'
        WHEN '操作日志' THEN 'Operation Logs'
        ELSE name_en
    END,
    name_zh_tw = CASE name
        WHEN '系统管理' THEN '系統設置'
        WHEN '用户管理' THEN '用戶管理'
        WHEN '菜单管理' THEN '選單管理'
        WHEN '部门管理' THEN '部門管理'
        WHEN '角色管理' THEN '角色管理'
        WHEN '消息中心' THEN '通知中心'
        WHEN '接口白名单' THEN '接口白名單'
        WHEN '下载中心' THEN '下載中心'
        WHEN '常规配置' THEN '常規配置'
        WHEN '系统配置' THEN '系統配置'
        WHEN '字典管理' THEN '字典管理'
        WHEN '地区管理' THEN '地區管理'
        WHEN '附件管理' THEN '附件管理'
        WHEN '日志管理' THEN '日誌管理'
        WHEN '登录日志' THEN '登錄日誌'
        WHEN '操作日志' THEN '操作日誌'
        ELSE name_zh_tw
    END
WHERE name_en IS NULL OR name_zh_tw IS NULL;
