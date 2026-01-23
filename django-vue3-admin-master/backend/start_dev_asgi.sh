#!/bin/bash
echo "========================================"
echo "Starting Django ASGI Server"
echo "WebSocket Support: Enabled"
echo "Server: Uvicorn"
echo "========================================"
echo ""
uvicorn application.asgi:application --host 0.0.0.0 --port 8000 --reload
