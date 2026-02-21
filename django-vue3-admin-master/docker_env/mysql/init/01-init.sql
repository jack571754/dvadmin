-- DVAdmin MySQL 初始化脚本
-- 此脚本在 MySQL 容器首次启动时执行

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `django-vue3-admin`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 授权
GRANT ALL PRIVILEGES ON `django-vue3-admin`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `django-vue3-admin`.* TO 'dvadmin'@'%' IDENTIFIED BY 'DVADMIN3';

FLUSH PRIVILEGES;

-- 使用数据库
USE `django-vue3-admin`;
