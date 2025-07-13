# GitHub 环境配置检查清单

## 📋 配置前准备

在开始配置之前，请确保您有以下信息：

- ✅ 服务器SSH私钥
- ✅ 数据库密码
- ✅ JWT密钥（建议为每个环境生成不同的密钥）
- ✅ 服务器访问权限

## 🔧 GitHub 环境配置步骤

### 1. 访问环境设置
1. 进入 GitHub 仓库
2. 点击 `Settings` 标签
3. 在左侧菜单中选择 `Environments`

### 2. 创建两个环境

#### 🟡 staging 环境
点击 `New environment`，输入名称：`staging`

**必需的环境变量：**
```
SERVER_HOST=8.140.237.185
SERVER_USER=root
SSH_PRIVATE_KEY=[您的SSH私钥内容]
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[数据库密码]
JWT_SECRET=[预生产环境JWT密钥]
```

**可选的环境变量：**
```
CORS_ORIGINS=http://xitools.furdow.com:8081
VITE_BACKEND_URL=http://xitools.furdow.com:8081/api
```

#### 🔴 production 环境
点击 `New environment`，输入名称：`production`

**必需的环境变量：**
```
SERVER_HOST=8.140.237.185
SERVER_USER=root
SSH_PRIVATE_KEY=[您的SSH私钥内容]
DATABASE_URL=postgresql://postgres:[密码]@postgres:5432/xitools
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[数据库密码]
POSTGRES_DB=xitools
JWT_SECRET=[生产环境JWT密钥]
VITE_BACKEND_URL=https://xitools.furdow.com/api
CORS_ORIGINS=https://xitools.furdow.com,http://xitools.furdow.com
```

## 🔐 安全配置建议

### SSH 私钥配置
1. 确保SSH私钥格式正确（包含 `-----BEGIN` 和 `-----END` 行）
2. 私钥应该是完整的，包括所有换行符
3. 建议为CI/CD创建专用的SSH密钥对

### JWT 密钥生成
为每个环境生成不同的JWT密钥：

```bash
# 生成强随机密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 或使用 openssl
openssl rand -hex 64
```

### 数据库密码
- 使用强密码
- 每个环境可以使用相同的数据库密码（因为数据库实例是隔离的）
- 确保密码不包含特殊字符，避免在shell中出现问题

## ✅ 配置验证清单

### staging 环境检查
- [ ] SERVER_HOST 已设置
- [ ] SERVER_USER 已设置
- [ ] SSH_PRIVATE_KEY 已设置且格式正确
- [ ] POSTGRES_USER 已设置
- [ ] POSTGRES_PASSWORD 已设置
- [ ] JWT_SECRET 已设置

### production 环境检查
- [ ] SERVER_HOST 已设置
- [ ] SERVER_USER 已设置
- [ ] SSH_PRIVATE_KEY 已设置且格式正确
- [ ] DATABASE_URL 已设置
- [ ] POSTGRES_USER 已设置
- [ ] POSTGRES_PASSWORD 已设置
- [ ] POSTGRES_DB 已设置
- [ ] JWT_SECRET 已设置
- [ ] VITE_BACKEND_URL 已设置
- [ ] CORS_ORIGINS 已设置

## 🧪 测试配置

配置完成后，可以通过以下方式测试：

### 1. 手动触发工作流
在 GitHub Actions 页面手动触发各环境的部署工作流

### 2. 推送测试分支
```bash
# 测试feature分支CI检查
git checkout -b feature/test-ci
git push origin feature/test-ci

# 测试预生产环境
git checkout develop
git push origin develop

# 测试生产环境（谨慎操作）
git checkout main
git push origin main
```

### 3. 使用验证脚本
```bash
# 快速检查所有环境
npm run verify:deployment:quick

# 完整检查
npm run verify:deployment
```

## 🚨 常见问题排查

### SSH 连接失败
- 检查SSH私钥格式是否正确
- 确认服务器SSH服务正常运行
- 验证SERVER_HOST和SERVER_USER是否正确

### 数据库连接失败
- 检查POSTGRES_PASSWORD是否正确
- 确认数据库服务是否启动
- 验证DATABASE_URL格式是否正确

### 构建失败
- 检查Node.js版本是否兼容
- 确认依赖安装是否成功
- 查看GitHub Actions日志获取详细错误信息

### 健康检查失败
- 等待更长时间让服务完全启动
- 检查nginx配置是否正确
- 验证端口是否被正确映射

## 📞 获取帮助

如果遇到配置问题：
1. 查看GitHub Actions的详细日志
2. 检查服务器上的Docker容器状态
3. 使用验证脚本诊断问题
4. 参考环境配置指南文档
