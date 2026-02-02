# Python 3.11.11 下载和安装脚本
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Python 3.11.11 安装助手" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 设置变量
$pythonUrl = "https://www.python.org/ftp/python/3.11.11/python-3.11.11-amd64.exe"
$downloadPath = "$env:TEMP\python-3.11.11-amd64.exe"

# 检查是否已下载
if (Test-Path $downloadPath) {
    Write-Host "✅ 安装程序已存在" -ForegroundColor Green
    $size = (Get-Item $downloadPath).Length / 1MB
    Write-Host "   路径: $downloadPath" -ForegroundColor Gray
    Write-Host "   大小: $([math]::Round($size, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "📥 正在下载 Python 3.11.11..." -ForegroundColor Yellow
    Write-Host "   下载地址: $pythonUrl" -ForegroundColor Gray

    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $pythonUrl -OutFile $downloadPath -UseBasicParsing

        if (Test-Path $downloadPath) {
            $size = (Get-Item $downloadPath).Length / 1MB
            Write-Host "   ✅ 下载完成!" -ForegroundColor Green
            Write-Host "   文件大小: $([math]::Round($size, 2)) MB" -ForegroundColor Gray
            Write-Host "   保存位置: $downloadPath" -ForegroundColor Gray
        } else {
            throw "下载失败"
        }
    } catch {
        Write-Host "   ❌ 下载失败: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "请手动下载：" -ForegroundColor Yellow
        Write-Host "   https://www.python.org/ftp/python/3.11.11/python-3.11.11-amd64.exe" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "准备安装 Python 3.11.11" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 安装说明：" -ForegroundColor Yellow
Write-Host ""
Write-Host "安装程序即将启动，请按以下步骤操作：" -ForegroundColor White
Write-Host ""
Write-Host "1️⃣  第一个界面：" -ForegroundColor Cyan
Write-Host "   ☑ Add Python 3.11 to PATH          【必须勾选】" -ForegroundColor Green
Write-Host "   ☑ Install for all users            【推荐勾选】" -ForegroundColor Green
Write-Host ""
Write-Host "   点击 'Customize installation'" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Optional Features（全部勾选）：" -ForegroundColor Cyan
Write-Host "   ☑ pip" -ForegroundColor Green
Write-Host "   ☑ tcl/tk and IDLE" -ForegroundColor Green
Write-Host "   ☑ Python test suite" -ForegroundColor Green
Write-Host "   ☑ py launcher (for all users)" -ForegroundColor Green
Write-Host ""
Write-Host "   点击 'Next'" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Advanced Options（重要）：" -ForegroundColor Cyan
Write-Host "   ☑ Install for all users" -ForegroundColor Green
Write-Host "   ☑ Associate files with Python (.py, .pyw)" -ForegroundColor Green
Write-Host "   ☑ Create shortcuts for installed applications" -ForegroundColor Green
Write-Host "   ☑ Add Python to environment variables  【必须勾选】" -ForegroundColor Green
Write-Host "   ☑ Precompile standard library" -ForegroundColor Green
Write-Host ""
Write-Host "   安装路径建议：" -ForegroundColor Yellow
Write-Host "   C:\Python311\" -ForegroundColor Gray
Write-Host ""
Write-Host "   点击 'Install'" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣  等待安装完成（约 2-3 分钟）" -ForegroundColor Cyan
Write-Host ""
Write-Host "5️⃣  安装完成后，关闭所有 PowerShell 窗口" -ForegroundColor Cyan
Write-Host "   重新打开新的 PowerShell 窗口验证安装" -ForegroundColor Gray
Write-Host ""

$install = Read-Host "是否现在启动安装程序？(y/N)"

if ($install -eq "y" -or $install -eq "Y") {
    Write-Host ""
    Write-Host "🚀 启动安装程序..." -ForegroundColor Green
    Start-Process $downloadPath
    Write-Host ""
    Write-Host "✅ 安装程序已启动！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 安装完成后的验证步骤：" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. 关闭所有 PowerShell 窗口" -ForegroundColor White
    Write-Host "2. 打开新的 PowerShell 窗口" -ForegroundColor White
    Write-Host "3. 运行以下命令验证：" -ForegroundColor White
    Write-Host "   python --version" -ForegroundColor Cyan
    Write-Host "   应该显示：Python 3.11.11" -ForegroundColor Green
    Write-Host ""
    Write-Host "4. 然后运行此命令继续升级：" -ForegroundColor White
    Write-Host "   cd E:\project\dvadmin" -ForegroundColor Cyan
    Write-Host "   .\setup_python311.ps1" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⏸️  安装已取消" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "如需手动安装，请运行：" -ForegroundColor Cyan
    Write-Host "   $downloadPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "或从此地址下载：" -ForegroundColor Cyan
    Write-Host "   https://www.python.org/ftp/python/3.11.11/python-3.11.11-amd64.exe" -ForegroundColor Gray
    Write-Host ""
}
