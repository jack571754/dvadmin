# API 连接问题解决方案

## 问题描述
当打开前端页面时，出现以下错误：
```
[API Error] 网络连接失败，请检查网络设置
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

## 问题原因
后端 API 服务（localhost:10025）没有启动。

## 解决方案

### 方案一：启动后端服务
1. 确保后端 DVAdmin 服务正在运行
2. 后端服务应该运行在 `http://localhost:10025`
3. 如果后端运行在其他端口，请修改 `.env` 文件中的 `VITE_API_BASE_URL`

### 方案二：检查 API 端点
使用 curl 或浏览器访问以下端点确认服务可用：
- `http://localhost:10025/api/` - 基础 API 端点
- `http://localhost:10025/api/blog/articles/` - 文章列表端点
- `http://localhost:10025/api/blog/categories/` - 分类端点

### 方案三：使用模拟数据（开发时临时方案）
如果暂时无法启动后端，可以创建模拟数据服务。

## 前端连接机制

1. **自动重试**：前端会自动重试连接 3 次，每次间隔 2 秒
2. **连接状态页**：如果后端不可用，会显示连接状态页面
3. **友好错误提示**：提供清晰的错误信息和重试按钮

## 配置说明

### 环境变量配置
在 `.env` 文件中配置：
```env
VITE_API_BASE_URL=http://localhost:10025/api
```

### Vite 代理配置
`vite.config.ts` 中的代理配置：
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:10025',
    changeOrigin: true,
  },
}
```

## 快速启动

使用提供的启动脚本：
- Windows: `start-dev.bat`
- macOS/Linux: `start-dev.sh`

## 验证步骤

1. 启动后端服务
2. 启动前端服务 (`npm run dev`)
3. 访问 `http://localhost:5173`
4. 检查浏览器控制台确认 API 请求成功

## 常见问题

### Q: 后端启动了但仍然连接失败
A: 检查：
- 后端是否正确监听 10025 端口
- 防火墙是否阻止了连接
- 后端 CORS 配置是否正确

### Q: 如何在开发时使用不同的后端端口
A: 修改 `.env` 文件：
```env
VITE_API_BASE_URL=http://localhost:PORT/api
```
将 PORT 替换为实际端口号。

### Q: 生产环境如何配置
A: 在生产环境中，确保：
1. 环境变量正确设置
2. 后端 API 可访问
3. CORS 配置正确

## 需要帮助？
如果问题仍然存在，请检查：
1. 后端服务日志
2. 前端控制台错误详情
3. 网络连接状态