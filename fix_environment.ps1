# DVAdmin 环境修复助手
# 使用方法：在 PowerShell 中运行 .\fix_environment.ps1

param(
    [switch]$Force = $false
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "DVAdmin 环境修复助手" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否以管理员身份运行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  建议以管理员身份运行此脚本" -ForegroundColor Yellow
    Write-Host ""
}

# 创建版本锁定文件
Write-Host "📌 创建版本锁定文件..." -ForegroundColor Yellow

# 创建 .python-version 文件
$pythonVersionContent = "3.11.11"
$pythonVersionPath = ".python-version"
if (-not (Test-Path $pythonVersionPath) -or $Force) {
    Set-Content -Path $pythonVersionPath -Value $pythonVersionContent -Encoding UTF8
    Write-Host "  ✅ 创建 .python-version (Python 3.11.11)" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  .python-version 已存在" -ForegroundColor White
}

# 创建 .nvmrc 文件
$nvmrcContent = "20.18.2"
$nvmrcPath = "web/.nvmrc"
if (-not (Test-Path $nvmrcPath) -or $Force) {
    # 确保 web 目录存在
    if (-not (Test-Path "web")) {
        New-Item -ItemType Directory -Path "web" -Force | Out-Null
    }
    Set-Content -Path $nvmrcPath -Value $nvmrcContent -Encoding UTF8
    Write-Host "  ✅ 创建 web/.nvmrc (Node.js 20.18.2 LTS)" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  web/.nvmrc 已存在" -ForegroundColor White
}

Write-Host ""

# 检查并提示安装 nvm-windows
Write-Host "📌 检查 nvm-windows..." -ForegroundColor Yellow
$nvmInstalled = Get-Command nvm -ErrorAction SilentlyContinue
if (-not $nvmInstalled) {
    Write-Host "  ⚠️  未检测到 nvm-windows" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  推荐安装 nvm-windows 来管理 Node.js 版本：" -ForegroundColor Cyan
    Write-Host "  1. 下载地址：https://github.com/coreybutler/nvm-windows/releases" -ForegroundColor White
    Write-Host "  2. 下载 nvm-setup.exe 并安装" -ForegroundColor White
    Write-Host "  3. 安装后重启 PowerShell 并运行：" -ForegroundColor White
    Write-Host "     nvm install 20.18.2" -ForegroundColor Gray
    Write-Host "     nvm use 20.18.2" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "  ✅ nvm-windows 已安装" -ForegroundColor Green
    $currentNodeVersion = nvm current 2>&1
    Write-Host "  当前版本: $currentNodeVersion" -ForegroundColor White

    if ($currentNodeVersion -notmatch "20\.") {
        Write-Host ""
        Write-Host "  建议切换到 Node.js 20 LTS：" -ForegroundColor Cyan
        Write-Host "     nvm install 20.18.2" -ForegroundColor Gray
        Write-Host "     nvm use 20.18.2" -ForegroundColor Gray
    }
}

Write-Host ""

# 检查 Python 版本
Write-Host "📌 检查 Python 版本..." -ForegroundColor Yellow
try {
    $pythonVersionOutput = python --version 2>&1
    if ($pythonVersionOutput -match "3\.13") {
        Write-Host "  ❌ 检测到 Python 3.13，不兼容 Django 4.2！" -ForegroundColor Red
        Write-Host ""
        Write-Host "  修复选项：" -ForegroundColor Cyan
        Write-Host "  1. 【推荐】使用 pyenv-win 管理多版本：" -ForegroundColor White
        Write-Host "     pip install pyenv-win --target %USERPROFILE%\.pyenv" -ForegroundColor Gray
        Write-Host "     # 然后添加到 PATH 环境变量" -ForegroundColor Gray
        Write-Host "     pyenv install 3.11.11" -ForegroundColor Gray
        Write-Host "     pyenv local 3.11.11" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  2. 手动安装 Python 3.11：" -ForegroundColor White
        Write-Host "     下载：https://www.python.org/ftp/python/3.11.11/python-3.11.11-amd64.exe" -ForegroundColor Gray
        Write-Host "     安装时勾选 'Add Python to PATH'" -ForegroundColor Gray
        Write-Host ""
    } elseif ($pythonVersionOutput -match "3\.1[12]") {
        Write-Host "  ✅ Python 版本兼容！" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Python 版本：$pythonVersionOutput" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ 未检测到 Python" -ForegroundColor Red
    Write-Host ""
    Write-Host "  请安装 Python 3.11 或 3.12：" -ForegroundColor Cyan
    Write-Host "  https://www.python.org/downloads/" -ForegroundColor White
}

Write-Host ""

# 提供创建虚拟环境的命令
Write-Host "📌 后端虚拟环境..." -ForegroundColor Yellow
if (-not (Test-Path "backend/venv")) {
    Write-Host "  虚拟环境不存在，建议创建：" -ForegroundColor Cyan
    Write-Host "     cd backend" -ForegroundColor Gray
    Write-Host "     python -m venv venv" -ForegroundColor Gray
    Write-Host "     .\venv\Scripts\activate" -ForegroundColor Gray
    Write-Host "     pip install -r requirements.txt" -ForegroundColor Gray
} else {
    Write-Host "  ✅ 虚拟环境已存在" -ForegroundColor Green
}

Write-Host ""

# 提供重新安装前端依赖的命令
Write-Host "📌 前端依赖..." -ForegroundColor Yellow
if (-not (Test-Path "web/node_modules")) {
    Write-Host "  node_modules 不存在，需要安装依赖：" -ForegroundColor Cyan
    Write-Host "     cd web" -ForegroundColor Gray
    Write-Host "     npm install" -ForegroundColor Gray
    Write-Host "     # 或" -ForegroundColor Gray
    Write-Host "     yarn install" -ForegroundColor Gray
} else {
    Write-Host "  ✅ node_modules 已存在" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "修复建议已生成！" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 详细修复步骤请参考：VERSION_COMPATIBILITY.md" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
