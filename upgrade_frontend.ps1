# DVAdmin 前端依赖升级脚本（方案 A - 保守升级）
# 使用方法：在 PowerShell 中运行 .\upgrade_frontend.ps1

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "DVAdmin 前端依赖升级" -ForegroundColor Cyan
Write-Host "方案 A：保守升级（推荐）" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$webPath = "E:\project\dvadmin\django-vue3-admin-master\web"

# 检查 web 目录
if (-not (Test-Path $webPath)) {
    Write-Host "❌ 未找到 web 目录：$webPath" -ForegroundColor Red
    exit 1
}

# 备份当前 package.json
$packageBackup = "$webPath\package.json.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
if (Test-Path "$webPath\package.json") {
    Copy-Item "$webPath\package.json" $packageBackup
    Write-Host "📦 已备份 package.json 到：" -ForegroundColor Yellow
    Write-Host "   $packageBackup" -ForegroundColor Gray
}

Write-Host ""

# 定义要升级的包
$packages = @(
    # 关键升级（性能提升）
    @{
        "name" = "vue"
        "version" = "3.5"
        "from" = "3.4.38"
        "risk" = "低"
        "reason" = "性能提升 56%，内存减少 56%"
    },
    # 安全升级（小版本）
    @{
        "name" = "element-plus"
        "version" = "2.13.2"
        "from" = "2.13.1"
        "risk" = "低"
        "reason" = "UI 组件 bug 修复"
    },
    @{
        "name" = "axios"
        "version" = "1.13.4"
        "from" = "1.13.2"
        "risk" = "低"
        "reason" = "HTTP 客户端安全更新"
    },
    @{
        "name" = "autoprefixer"
        "version" = "10.4.24"
        "from" = "10.4.23"
        "risk" = "低"
        "reason" = "CSS 前缀处理改进"
    }
)

# 显示升级计划
Write-Host "📋 升级计划：" -ForegroundColor Cyan
Write-Host ""

foreach ($pkg in $packages) {
    $riskColor = if ($pkg.risk -eq "低") { "Green" } else { "Yellow" }

    Write-Host "  $($pkg.name)" -ForegroundColor White
    Write-Host "    $($pkg.from) → $($pkg.version)" -ForegroundColor $riskColor
    Write-Host "    风险：$($pkg.risk)" -ForegroundColor Gray
    Write-Host "    原因：$($pkg.reason)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "🔒 不升级的包（避免破坏性变更）：" -ForegroundColor Cyan
Write-Host "  Vue Router 4.x → 保持 4.x" -ForegroundColor Green
Write-Host "  Pinia 2.x → 保持 2.x" -ForegroundColor Green
Write-Host "  Vite 5.x → 保持 5.x" -ForegroundColor Green
Write-Host "  TypeScript 4.x → 保持 4.x" -ForegroundColor Green
Write-Host "  TailwindCSS 3.x → 保持 3.x" -ForegroundColor Green
Write-Host "  ECharts 5.x → 保持 5.x" -ForegroundColor Green
Write-Host ""

# Dry Run 模式
if ($DryRun) {
    Write-Host "🔍 Dry Run 模式：仅显示计划，不执行升级" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "如需执行升级，请运行：" -ForegroundColor Cyan
    Write-Host "  .\upgrade_frontend.ps1" -ForegroundColor Gray
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

# 切换到 web 目录
Set-Location $webPath

# 检查 node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules 不存在，将先安装依赖" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "运行 npm install..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# 检查 npm
Write-Host "🔍 检查 npm 版本..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "  npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ npm 不可用" -ForegroundColor Red
    exit 1
}

# 升级各个包
$successCount = 0
$failCount = 0

foreach ($pkg in $packages) {
    $packageName = $pkg.name
    $packageVersion = $pkg.version

    Write-Host ""
    Write-Host "📦 升级 $packageName 到 $packageVersion..." -ForegroundColor Yellow

    try {
        npm install "$packageName@$packageVersion"
        Write-Host "  ✅ $packageName 升级成功" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "  ❌ $packageName 升级失败：$_" -ForegroundColor Red
        $failCount++
    }
}

# 清理 npm 缓存
Write-Host ""
Write-Host "🧹 清理 npm 缓存..." -ForegroundColor Yellow
try {
    npm cache clean --force
    Write-Host "  ✅ 缓存已清理" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  缓存清理失败（非致命）" -ForegroundColor Yellow
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
    Write-Host "  Copy-Item '$packageBackup' 'package.json'" -ForegroundColor Gray
    Write-Host "  rm -r -fo node_modules" -ForegroundColor Gray
    Write-Host "  npm install" -ForegroundColor Gray
} else {
    Write-Host "✅ 所有包升级成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Vue 3.5 性能提升：" -ForegroundColor Cyan
    Write-Host "  • 56% 内存使用减少" -ForegroundColor Green
    Write-Host "  • 10x 大型数组操作速度提升" -ForegroundColor Green
    Write-Host "  • 50% 更好的内存效率" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步：" -ForegroundColor Cyan
    Write-Host "  1. 开发模式测试：npm run dev" -ForegroundColor Gray
    Write-Host "  2. 生产构建测试：npm run build" -ForegroundColor Gray
    Write-Host "  3. 提交更改：git add package.json package-lock.json && git commit -m 'chore: 升级前端依赖'" -ForegroundColor Gray
}

Write-Host ""
