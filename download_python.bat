@echo off
echo ========================================
echo Python 3.11.11 Download Helper
echo ========================================
echo.

set PYTHON_URL=https://www.python.org/ftp/python/3.11.11/python-3.11.11-amd64.exe
set OUTPUT=%TEMP%\python-3.11.11-amd64.exe

echo Downloading Python 3.11.11...
echo From: %PYTHON_URL%
echo To: %OUTPUT%
echo.

powershell -Command "& {$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '%PYTHON_URL%' -OutFile '%OUTPUT%' -UseBasicParsing}"

if exist "%OUTPUT%" (
    echo.
    echo ========================================
    echo Download Complete!
    echo ========================================
    echo.
    echo File: %OUTPUT%
    echo.
    echo Starting installer...
    echo.
    start "" "%OUTPUT%"

    echo.
    echo ========================================
    echo Installation Instructions
    echo ========================================
    echo.
    echo 1. First screen:
    echo    [x] Add Python 3.11 to PATH
    echo    [x] Install for all users
    echo    Click: Customize installation
    echo.
    echo 2. Optional Features (check all):
    echo    [x] pip
    echo    [x] tcl/tk and IDLE
    echo    [x] Python test suite
    echo    [x] py launcher
    echo    Click: Next
    echo.
    echo 3. Advanced Options:
    echo    [x] Install for all users
    echo    [x] Associate files with Python
    echo    [x] Create shortcuts
    echo    [x] Add Python to environment variables
    echo    [x] Precompile standard library
    echo.
    echo    Install to: C:\Python311\
    echo    Click: Install
    echo.
    echo 4. Wait for installation to complete
    echo.
    echo 5. Close all PowerShell windows
    echo.
    echo 6. Open new PowerShell and run:
    echo    cd E:\project\dvadmin
    echo    .\setup_python311.ps1
    echo.
) else (
    echo.
    echo ========================================
    echo Download Failed!
    echo ========================================
    echo.
    echo Please download manually:
    echo %PYTHON_URL%
    echo.
)

pause
