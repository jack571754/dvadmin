# DVAdmin 环境检查脚本
# 使用方法：在 PowerShell 中运行 .\check_environment.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "DVAdmin 环境兼容性检查" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# 检查 Python 版本
Write-Host "📌 检查 Python 版本..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  当前版本: $pythonVersion" -ForegroundColor White

    if ($pythonVersion -match "3\.1[12]") {
        Write-Host "  ✅ Python 版本兼容" -ForegroundColor Green
    } elseif ($pythonVersion -match "3\.13") {
        Write-Host "  ❌ Python 3.13 与 Django 4.2 不兼容！" -ForegroundColor Red
        Write-Host "     建议：降级到 Python 3.11 或 3.12" -ForegroundColor Red
        $errors++
    } else {
        Write-Host "  ⚠️  Python 版本可能不兼容" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "  ❌ 未找到 Python" -ForegroundColor Red
    $errors++
}

Write-Host ""

# 检查 Node.js 版本
Write-Host "📌 检查 Node.js 版本..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  当前版本: $nodeVersion" -ForegroundColor White

    if ($nodeVersion -match "v2[012]\.") {
        Write-Host "  ✅ Node.js 版本兼容 (LTS)" -ForegroundColor Green
    } elseif ($nodeVersion -match "v23\.") {
        Write-Host "  ⚠️  Node.js v23 较新，可能有兼容性问题" -ForegroundColor Yellow
        Write-Host "     建议：使用 Node.js 20 LTS 或 22 LTS" -ForegroundColor Yellow
        $warnings++
    } else {
        Write-Host "  ⚠️  Node.js 版本过旧" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "  ❌ 未找到 Node.js" -ForegroundColor Red
    $errors++
}

Write-Host ""

# 检查 pip
Write-Host "📌 检查 pip..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    Write-Host "  $pipVersion" -ForegroundColor White
    Write-Host "  ✅ pip 可用" -ForegroundColor Green
} catch {
    Write-Host "  ❌ pip 不可用" -ForegroundColor Red
    $errors++
}

Write-Host ""

# 检查 npm
Write-Host "📌 检查 npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "  npm version: $npmVersion" -ForegroundColor White
    Write-Host "  ✅ npm 可用" -ForegroundColor Green
} catch {
    Write-Host "  ❌ npm 不可用" -ForegroundColor Red
    $errors++
}

Write-Host ""

# 检查项目依赖
Write-Host "📌 检查后端依赖..." -ForegroundColor Yellow
$backendPath = "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
    try {
        $djangoInstalled = pip show django 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Django 已安装" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Django 未安装" -ForegroundColor Red
            $errors++
        }

        $drfInstalled = pip show djangorestframework 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Django REST Framework 已安装" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Django REST Framework 未安装" -ForegroundColor Yellow
            $warnings++
        }
    } catch {
        Write-Host "  ⚠️  无法检查后端依赖" -ForegroundColor Yellow
        $warnings++
    }
    Set-Location ..
} else {
    Write-Host "  ⚠️  未找到 backend 目录" -ForegroundColor Yellow
    $warnings++
}

Write-Host ""

# 检查前端依赖
Write-Host "📌 检查前端依赖..." -ForegroundColor Yellow
$webPath = "web"
if (Test-Path $webPath) {
    if (Test-Path "$webPath/package.json") {
        Write-Host "  ✅ package.json 存在" -ForegroundColor Green
        if (Test-Path "$webPath/node_modules") {
            Write-Host "  ✅ node_modules 存在" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  node_modules 不存在，需要运行 npm install" -ForegroundColor Yellow
            $warnings++
        }
    } else {
        Write-Host "  ❌ package.json 不存在" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "  ⚠️  未找到 web 目录" -ForegroundColor Yellow
    $warnings++
}

Write-Host ""

# 检查虚拟环境
Write-Host "📌 检查虚拟环境..." -ForegroundColor Yellow
if (Test-Path "backend/venv") {
    Write-Host "  ✅ 虚拟环境存在" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  虚拟环境不存在，建议创建：python -m venv backend/venv" -ForegroundColor Yellow
    $warnings++
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "检查结果：" -ForegroundColor Cyan
Write-Host "  错误: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host "  警告: $warnings" -ForegroundColor $(if ($warnings -gt 0) { "Yellow" } else { "Green" })
Write-Host "================================" -ForegroundColor Cyan

if ($errors -gt 0) {
    Write-Host ""
    Write-Host "❌ 发现严重问题，请修复后继续！" -ForegroundColor Red
    Write-Host "详细修复步骤请参考：VERSION_COMPATIBILITY.md" -ForegroundColor Red
    exit 1
} elseif ($warnings -gt 0) {
    Write-Host ""
    Write-Host "⚠️  发现一些警告，建议修复！" -ForegroundColor Yellow
    Write-Host "详细修复步骤请参考：VERSION_COMPATIBILITY.md" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host ""
    Write-Host "✅ 环境检查通过！" -ForegroundColor Green
    exit 0
}
