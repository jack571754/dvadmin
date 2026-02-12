# 激活虚拟环境并启动 ASGI 服务器
& ".\venv\Scripts\Activate.ps1"
uvicorn application.asgi:application --host 0.0.0.0 --port 9999 --reload
