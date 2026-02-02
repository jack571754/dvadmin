# Python 3.11.11 快速安装指南

## 方法一：直接下载安装（推荐）

### 1. 下载 Python 3.11.11

**直接下载链接**（点击即可下载）：
```
https://www.python.org/ftp/python/3.11.11/python-3.11.11-amd64.exe
```

或者使用浏览器访问：
```
https://www.python.org/downloads/release/python-31111/
```

找到 "Windows installer (64-bit)" 并下载

### 2. 安装步骤（重要！）

运行下载的 `python-3.11.11-amd64.exe`，按以下步骤操作：

#### 步骤 1：第一个界面
```
✅ Add Python 3.11 to PATH          【必须勾选】
✅ Install for all users            【推荐勾选】

点击 "Customize installation"
```

#### 步骤 2：Optional Features
```
✅ pip
✅ tcl/tk and IDLE
✅ Python test suite
✅ py launcher (for all users)

点击 "Next"
```

#### 步骤 3：Advanced Options
```
✅ Install for all users
✅ Associate files with Python (.py, .pyw)
✅ Create shortcuts for installed applications
✅ Add Python to environment variables  【必须勾选】
✅ Precompile standard library

安装路径：C:\Python311\

点击 "Install"
```

#### 步骤 4：等待安装
安装过程大约需要 2-3 分钟

### 3. 验证安装

关闭所有 PowerShell 窗口，打开新的 PowerShell，运行：

```powershell
python --version
# 应该显示：Python 3.11.11
```

### 4. 配置项目环境

安装完成后，在 PowerShell 中运行：

```powershell
# 进入项目目录
cd E:\project\dvadmin

# 运行配置脚本
.\setup_python311.ps1
```

---

## 方法二：使用 pyenv 管理多版本（高级用户）

如果你已经安装了 pyenv-win：

```powershell
# 安装 Python 3.11.11
pyenv install 3.11.11

# 切换到项目目录
cd E:\project\dvadmin

# 设置项目使用的 Python 版本
pyenv local 3.11.11

# 验证
python --version

# 然后运行配置脚本
.\setup_python311.ps1
```

---

## 常见问题

### Q: 安装后 `python --version` 仍显示 3.13？
**A:** 需要调整 PATH 环境变量：

1. 右键 "此电脑" → "属性"
2. "高级系统设置" → "环境变量"
3. 在 "系统变量" 中找到 "Path"
4. 将 Python 3.11 的路径移到最前面：
   ```
   C:\Python311\
   C:\Python311\Scripts\
   ```
5. 点击"确定"保存
6. 关闭所有 PowerShell 窗口
7. 重新打开 PowerShell 验证

### Q: 如何同时保留 Python 3.13 和 3.11？
**A:** 使用虚拟环境或 pyenv：

```powershell
# 使用虚拟环境
cd E:\project\dvadmin\django-vue3-admin-master\backend
C:\Python311\python.exe -m venv venv
.\venv\Scripts\activate
python --version  # 应该显示 3.11.11
```

---

## 安装完成后

运行配置脚本：

```powershell
cd E:\project\dvadmin
.\setup_python311.ps1
```

这个脚本会：
1. ✅ 验证 Python 3.11.11 安装
2. ✅ 创建虚拟环境
3. ✅ 安装所有依赖
4. ✅ 运行 Django 检查

---

## 下一步

配置完成后，运行后端升级：

```powershell
cd E:\project\dvadmin
.\upgrade_backend.ps1
```

---

**需要帮助？**
- Python 官方文档：https://docs.python.org/3.11/using/windows.html
- pyenv-win：https://github.com/pyenv-win/pyenv-win
