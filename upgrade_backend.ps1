# DVAdmin 后端依赖升级脚本（方案 A - 保守升级）
# 使用方法：在 PowerShell 中运行 .\upgrade_backend.ps1

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "DVAdmin 后端依赖升级" -ForegroundColor Cyan
Write-Host "方案 A：保守升级（推荐）" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = "E:\project\dvadmin\django-vue3-admin-master\backend"

# 检查后端目录
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ 未找到 backend 目录：$backendPath" -ForegroundColor Red
    exit 1
}

# 备份当前 requirements.txt
$requirementsBackup = "$backendPath\requirements_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
if (Test-Path "$backendPath\requirements.txt") {
    Copy-Item "$backendPath\requirements.txt" $requirementsBackup
    Write-Host "📦 已备份 requirements.txt 到：" -ForegroundColor Yellow
    Write-Host "   $requirementsBackup" -ForegroundColor Gray
}

Write-Host ""

# 定义要升级的包
$packages = @{
    # 安全升级（小版本）
    "channels" = @{
        "version" = "4.3.2"
        "from" = "4.1.0"
        "risk" = "低"
        "reason" = "WebSocket 性能改进"
    }
    "channels-redis" = @{
        "version" = "4.3.0"
        "from" = "4.2.0"
        "risk" = "低"
        "reason" = "Redis 连接稳定性"
    }
    "django-cors-headers" = @{
        "version" = "4.9.0"
        "from" = "4.4.0"
        "risk" = "低"
        "reason" = "CORS 安全更新"
    }
    "django-filter" = @{
        "version" = "25.2"
        "from" = "24.2"
        "risk" = "低"
        "reason" = "过滤功能增强"
    }
    "djangorestframework" = @{
        "version" = "3.16.1"
        "from" = "3.15.2"
        "risk" = "低"
        "reason" = "bug 修复和性能改进"
    }
    "uvicorn" = @{
        "version" = "0.34.0"
        "from" = "0.30.3"
        "risk" = "低"
        "reason" = "ASGI 服务器性能提升"
    }
    # 中等风险升级
    "celery" = @{
        "version" = "5.6.2"
        "from" = "5.2.7"
        "risk" = "中"
        "reason" = "任务队列性能和稳定性"
    }
    "django-redis" = @{
        "version" = "6.0.0"
        "from" = "5.4.0"
        "risk" = "中"
        "reason" = "Redis 缓存性能提升"
    }
}

# 显示升级计划
Write-Host "📋 升级计划：" -ForegroundColor Cyan
Write-Host ""

foreach ($pkg in $packages.GetEnumerator()) {
    $info = $pkg.Value
    $riskColor = if ($info.risk -eq "低") { "Green" } else { "Yellow" }

    Write-Host "  $($pkg.Key)" -ForegroundColor White
    Write-Host "    $($info.from) → $($info.version)" -ForegroundColor $riskColor
    Write-Host "    风险：$($info.risk)" -ForegroundColor Gray
    Write-Host "    原因：$($info.reason)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "🔒 不升级的包：" -ForegroundColor Cyan
Write-Host "  Django 4.2.14 (LTS，支持到 2026-04)" -ForegroundColor Green
Write-Host ""

# Dry Run 模式
if ($DryRun) {
    Write-Host "🔍 Dry Run 模式：仅显示计划，不执行升级" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "如需执行升级，请运行：" -ForegroundColor Cyan
    Write-Host "  .\upgrade_backend.ps1" -ForegroundColor Gray
    exit 0
}

# 确认执行
if (-not $Force) {
    $confirm = Read-Host "是否继续执行升级？(y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "❌ 已取消升级" -ForegroundColor Red
        exit 0
    }
}

Write-Host ""
Write-Host "🚀 开始升级..." -ForegroundColor Cyan
Write-Host ""

# 切换到后端目录
Set-Location $backendPath

# 检查虚拟环境
if (-not (Test-Path "venv\Scripts\activate.ps1")) {
    Write-Host "❌ 未找到虚拟环境" -ForegroundColor Red
    Write-Host "请先创建虚拟环境：" -ForegroundColor Yellow
    Write-Host "  python -m venv venv" -ForegroundColor Gray
    exit 1
}

# 激活虚拟环境
Write-Host "🔧 激活虚拟环境..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# 升级 pip
Write-Host ""
Write-Host "📦 升级 pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# 升级各个包
$successCount = 0
$failCount = 0

foreach ($pkg in $packages.GetEnumerator()) {
    $packageName = $pkg.Key
    $packageVersion = $pkg.Value.version

    Write-Host ""
    Write-Host "📦 升级 $packageName 到 $packageVersion..." -ForegroundColor Yellow

    try {
        pip install --upgrade "$packageName==$packageVersion"
        Write-Host "  ✅ $packageName 升级成功" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "  ❌ $packageName 升级失败：$_" -ForegroundColor Red
        $failCount++
    }
}

# 更新 requirements.txt
Write-Host ""
Write-Host "📝 更新 requirements.txt..." -ForegroundColor Yellow
try {
    pip freeze > requirements.txt
    Write-Host "  ✅ requirements.txt 已更新" -ForegroundColor Green
} catch {
    Write-Host "  ❌ 更新失败：$_" -ForegroundColor Red
}

# 运行 Django 检查
Write-Host ""
Write-Host "🔍 运行 Django 系统检查..." -ForegroundColor Yellow
try {
    $checkResult = python manage.py check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Django 检查通过" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Django 检查发现问题：" -ForegroundColor Yellow
        Write-Host $checkResult -ForegroundColor Gray
    }
} catch {
    Write-Host "  ❌ Django 检查失败：$_" -ForegroundColor Red
}

# 显示结果
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "升级完成！" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "成功：$successCount 个包" -ForegroundColor Green
Write-Host "失败：$failCount 个包" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($failCount -gt 0) {
    Write-Host "⚠️  部分升级失败，请检查错误信息" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "如需回滚，请运行：" -ForegroundColor Cyan
    Write-Host "  Copy-Item '$requirementsBackup' 'requirements.txt'" -ForegroundColor Gray
    Write-Host "  pip install -r requirements.txt" -ForegroundColor Gray
} else {
    Write-Host "✅ 所有包升级成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步：" -ForegroundColor Cyan
    Write-Host "  1. 运行测试：python manage.py test" -ForegroundColor Gray
    Write-Host "  2. 启动服务器：uvicorn application.asgi:application" -ForegroundColor Gray
    Write-Host "  3. 提交更改：git add requirements.txt && git commit -m 'chore: 升级后端依赖'" -ForegroundColor Gray
}

Write-Host ""
