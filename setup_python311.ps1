# Python 3.11.11 安装后配置脚本
# 在安装完 Python 3.11 后运行此脚本

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Python 3.11.11 环境配置" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 验证 Python 版本
Write-Host "🔍 验证 Python 版本..." -ForegroundColor Yellow
try {
    $pythonVersionOutput = python --version 2>&1
    Write-Host "   当前版本: $pythonVersionOutput" -ForegroundColor White

    if ($pythonVersionOutput -match "3\.11\.11") {
        Write-Host "   ✅ Python 3.11.11 安装成功！" -ForegroundColor Green
    } elseif ($pythonVersionOutput -match "3\.11") {
        Write-Host "   ✅ Python 3.11 已安装" -ForegroundColor Green
    } elseif ($pythonVersionOutput -match "3\.13") {
        Write-Host "   ❌ 仍然是 Python 3.13，请重启 PowerShell 或重新安装" -ForegroundColor Red
        Write-Host ""
        Write-Host "解决方法：" -ForegroundColor Yellow
        Write-Host "1. 关闭所有 PowerShell 窗口" -ForegroundColor White
        Write-Host "2. 打开新的 PowerShell 窗口" -ForegroundColor White
        Write-Host "3. 运行: python --version 验证" -ForegroundColor White
        Write-Host "4. 如果仍是 3.13，需要调整 PATH 环境变量" -ForegroundColor White
        exit 1
    } else {
        Write-Host "   ⚠️  检测到 Python 版本: $pythonVersionOutput" -ForegroundColor Yellow
        Write-Host "   期望版本: Python 3.11.11" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ 未找到 Python" -ForegroundColor Red
    Write-Host "   请确保已安装 Python 3.11 并添加到 PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 验证 pip
Write-Host "🔍 验证 pip..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    Write-Host "   $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  pip 不可用，尝试安装..." -ForegroundColor Yellow
    python -m ensurepip --upgrade
}

Write-Host ""

# 切换到后端目录
$backendPath = "E:\project\dvadmin\django-vue3-admin-master\backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ 未找到 backend 目录：$backendPath" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath
Write-Host "📂 当前目录：$backendPath" -ForegroundColor Gray
Write-Host ""

# 检查并删除旧的虚拟环境
Write-Host "🔍 检查虚拟环境..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "   发现旧的虚拟环境，是否删除？(Y/n)" -ForegroundColor Yellow
    $delete = Read-Host
    if ($delete -ne "n" -and $delete -ne "N") {
        Write-Host "   删除旧的虚拟环境..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force venv
        Write-Host "   ✅ 已删除" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  保留旧的虚拟环境" -ForegroundColor Gray
    }
}

# 创建新的虚拟环境
if (-not (Test-Path "venv")) {
    Write-Host ""
    Write-Host "🔧 创建虚拟环境（使用 Python 3.11）..." -ForegroundColor Yellow
    python -m venv venv

    if (Test-Path "venv") {
        Write-Host "   ✅ 虚拟环境创建成功" -ForegroundColor Green
    } else {
        Write-Host "   ❌ 虚拟环境创建失败" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# 激活虚拟环境
Write-Host "🔧 激活虚拟环境..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# 验证虚拟环境中的 Python 版本
Write-Host ""
Write-Host "🔍 验证虚拟环境中的 Python 版本..." -ForegroundColor Yellow
$venvPythonVersion = python --version 2>&1
Write-Host "   $venvPythonVersion" -ForegroundColor White

if ($venvPythonVersion -match "3\.11") {
    Write-Host "   ✅ 虚拟环境使用 Python 3.11" -ForegroundColor Green
} else {
    Write-Host "   ❌ 虚拟环境未使用 Python 3.11" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 升级 pip
Write-Host "📦 升级 pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip
Write-Host "   ✅ pip 已升级" -ForegroundColor Green

Write-Host ""

# 安装依赖
Write-Host "📦 安装项目依赖..." -ForegroundColor Yellow
Write-Host "   这可能需要几分钟..." -ForegroundColor Gray
Write-Host ""

if (Test-Path "requirements.txt") {
    $installStart = Get-Date
    pip install -r requirements.txt

    $installEnd = Get-Date
    $installDuration = ($installEnd - $installStart).TotalSeconds

    Write-Host ""
    Write-Host "   ✅ 依赖安装完成（用时：$([math]::Round($installDuration, 2)) 秒）" -ForegroundColor Green
} else {
    Write-Host "   ❌ 未找到 requirements.txt" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 运行 Django 检查
Write-Host "🔍 运行 Django 系统检查..." -ForegroundColor Yellow
$checkResult = python manage.py check 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Django 检查通过" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Django 检查发现问题：" -ForegroundColor Yellow
    Write-Host $checkResult -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Python 3.11.11 环境配置完成！" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 下一步操作：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 激活虚拟环境（每次使用都需要）：" -ForegroundColor White
Write-Host "   cd E:\project\dvadmin\django-vue3-admin-master\backend" -ForegroundColor Cyan
Write-Host "   .\venv\Scripts\activate" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. 运行后端升级脚本：" -ForegroundColor White
Write-Host "   cd E:\project\dvadmin" -ForegroundColor Cyan
Write-Host "   .\upgrade_backend.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. 或直接启动后端服务：" -ForegroundColor White
Write-Host "   uvicorn application.asgi:application --host 0.0.0.0 --port 9000 --reload" -ForegroundColor Cyan
Write-Host ""
