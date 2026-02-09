# 激活虚拟环境并使用 Daphne 启动 ASGI 服务器（支持 WebSocket）
& ".\venv\Scripts\Activate.ps1"
daphne -b 0.0.0.0 -p 9999 application.asgi:application
