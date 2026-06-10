# Django-Vue3-Admin

> 基于 Django 5.2 + Vue 3.5 的企业级后台管理系统

## 平台简介

💡 [django-vue3-admin](https://github.com/jack571754/dvadmin.git) 是一套全部开源的快速开发平台，毫无保留给个人及企业免费使用。
    django-vue3-admin 基于 vue3 + CompositionAPI + typescript + vite + element plus, 是一款全栈，快速，开源的后台管理系统！

* 🧑‍🤝‍🧑前端采用 Vue3+TS+pinia+fastcrud(感谢[vue-next-admin](https://lyt-top.gitee.io/vue-next-admin-doc-preview/))
* 👭后端采用 Python 语言 Django 框架以及强大的 [Django REST Framework](https://pypi.org/project/djangorestframework)。
* 👫权限认证使用[Django REST Framework SimpleJWT](https://pypi.org/project/djangorestframework-simplejwt)，支持多终端认证系统。
* 👬支持加载动态权限菜单，多方式轻松权限控制。
* 💏特别鸣谢：[vue-next-admin](https://lyt-top.gitee.io/vue-next-admin-doc-preview/)。
* 💡 特别感谢[jetbrains](https://www.jetbrains.com/) 为本开源项目提供免费的 IntelliJ IDEA 授权。

#### 🏭 环境支持

| Edge      | Firefox      | Chrome      | Safari      |
| --------- | ------------ | ----------- | ----------- |
| Edge ≥ 79 | Firefox ≥ 78 | Chrome ≥ 64 | Safari ≥ 12 |

> 由于 Vue3 不再支持 IE11，故而 ElementPlus 也不支持 IE11 及之前版本。


## 源码地址

GitHub地址：[https://github.com/jack571754/dvadmin](https://github.com/jack571754/dvadmin)👩‍👦‍👦


## 内置功能

1.  👨‍⚕️菜单管理：配置系统菜单，操作权限，按钮权限标识、后端接口权限等。
2.  🧑‍⚕️部门管理：配置系统组织机构（公司、部门、角色）。
3.  👩‍⚕️角色管理：角色菜单权限分配、数据权限分配、设置角色按部门进行数据范围权限划分。
4.  按钮权限控制：授权角色的按钮权限和接口权限,可做到每一个接口都能授权数据范围。
5.  字段权限控制：授权页面的字段显示权限。
6.  用户管理：用户是系统操作者，该功能主要完成系统用户配置。
7.  接口白名单：配置不需要进行权限校验的接口。
8.  字典管理：对系统中经常使用的一些较为固定的数据进行维护。
9.  地区管理：对省市县区域进行管理。
10.  附件管理：对平台上所有文件、图片等进行统一管理。
11.  操作日志：系统正常操作日志记录和查询；系统异常信息日志记录和查询。


## 准备工作
~~~
Python >= 3.8.0 (推荐3.8+版本)
nodejs >= 14.0 (推荐最新)
Mysql >= 5.7.0 (可选，默认数据库sqlite3，推荐8.0版本)
Redis(可选，最新版)
~~~

## 前端♝

```bash
# 克隆项目
git clone https://github.com/jack571754/dvadmin.git

# 进入项目目录
cd web

# 安装依赖
npm install --registry=https://registry.npmmirror.com

# 启动服务
npm run dev
# 浏览器访问 http://localhost:8080
# .env.development 文件中可配置启动端口等参数
# 构建生产环境
# yarn run build
```



## 后端💈

~~~bash
1. 进入项目目录 cd backend
2. 在项目根目录中，复制 ./conf/env.example.py 文件为一份新的到 ./conf 文件夹下，并重命名为 env.py
3. 在 env.py 中配置数据库信息
	mysql数据库版本建议：8.0
	mysql数据库字符集：utf8mb4
4. 安装依赖环境
	pip3 install -r requirements.txt
5. 执行迁移命令：
	python3 manage.py makemigrations
	python3 manage.py migrate
6. 初始化数据
	python3 manage.py init
7. 初始化省市县数据:
	python3 manage.py init_area
8. 启动项目
	python3 manage.py runserver 0.0.0.0:8000
或使用 daphne :
  daphne -b 0.0.0.0 -p 8000 application.asgi:application
~~~

### 访问项目

- 访问地址：[http://localhost:8080](http://localhost:8080) (默认为此地址，如有修改请按照配置文件)
- 账号：`superadmin` 密码：`admin123456`





### docker-compose 运行

~~~shell
# 先安装docker-compose (自行百度安装),执行此命令等待安装，如有使用celery插件请打开docker-compose.yml中celery 部分注释
docker-compose up -d
# 初始化后端数据(第一次执行即可)
docker exec -ti dvadmin-django bash
python manage.py makemigrations 
python manage.py migrate
python manage.py init_area
python manage.py init
exit

前端地址：http://127.0.0.1:8080
后端地址：http://127.0.0.1:8080/api
# 在服务器上请把127.0.0.1 换成自己公网ip
账号：superadmin 密码：admin123456

# docker-compose 停止
docker-compose down
#  docker-compose 重启
docker-compose restart
#  docker-compose 启动时重新进行 build
docker-compose up -d --build
~~~
