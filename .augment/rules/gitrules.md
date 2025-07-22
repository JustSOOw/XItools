---
type: "manual"
---

# XItools 简化版 Git Flow 分支模型规则

## 🌟 概述

XItools 项目采用简化版 Git Flow 分支模型，这是一个在复杂性和实用性之间取得完美平衡的分支策略。它结合了 Git Flow 的结构化优势和 GitHub Flow 的简洁性，特别适合企业级项目的持续集成和部署。

## 🏗️ 分支架构

```
main (生产环境)
 ↑
develop (预发布环境)
 ↑
feature/* (功能开发)
```

### 分支类型详解

#### 1. 🚀 main 分支

**严格规则**:
- ❌ 禁止直接推送代码
- ❌ 禁止直接在此分支开发
- ✅ 只能通过审查过的 PR 合并
- ✅ 每次合并都应该对应一个发布版本

#### 2. 🔄 develop 分支

**规则**:
- ❌ 不建议直接在此分支开发
- ✅ 接受来自 feature 分支的 PR
- ✅ 代码应该相对稳定，测试通过
- ✅ 作为发布前的最终集成测试环境

#### 3. 🛠️ feature/* 分支

**命名规范**:
```
feature/功能描述          # 新功能开发
fix/问题描述             # Bug修复
hotfix/紧急修复          # 紧急修复
refactor/重构描述        # 代码重构
docs/文档更新            # 文档更新
```

**示例**:
- `feature/mcp-tool-enhancement`
- `fix/login-authentication-bug`
- `hotfix/security-vulnerability`
- `refactor/database-optimization`
- `docs/api-documentation-update`

## 🔄 完整工作流程

### 标准开发流程

#### 步骤 1: 创建功能分支
```bash
# 确保在 develop 分支
git checkout develop
git pull origin develop

# 创建新的功能分支
git checkout -b feature/your-feature-name
```

#### 步骤 2: 开发和提交
```bash
# 进行开发工作
# ... 编码 ...

# 提交变更
git add .
git commit -m "feat: 添加新功能描述"

# 推送到远程
git push -u origin feature/your-feature-name
```

#### 步骤 3: 创建 PR 到 develop
1. 在 GitHub 上创建 Pull Request
2. 目标分支选择 `develop`
3. 填写 PR 模板中的所有必要信息
4. 等待 CI 检查通过
5. 请求代码审查

#### 步骤 4: 合并到 develop
1. 代码审查通过后合并 PR
2. 自动触发预发布环境部署
3. 在预发布环境进行测试: http://xitools.furdow.com:8081
4. 删除已合并的 feature 分支

#### 步骤 5: 发布到生产环境
1. 在预发布环境充分测试后
2. 创建从 `develop` 到 `main` 的 PR
3. 进行最终审查
4. 合并后自动部署到生产环境: https://xitools.furdow.com

### 紧急修复流程 (Hotfix)

```bash
# 从 main 分支创建紧急修复分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 进行修复
# ... 修复代码 ...

# 提交并推送
git add .
git commit -m "hotfix: 修复关键安全漏洞"
git push -u origin hotfix/critical-security-fix

# 创建 PR 到 main (跳过 develop)
# 合并后同时合并回 develop 保持同步
```

## 📋 提交规范

### Commit Message 格式
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Type 类型
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建相关
- `ci`: CI配置
- `chore`: 其他杂项


## 🚀 CI/CD 集成

### 自动化流程
```
feature/* → CI检查 (ci.yml)
    ↓
develop → 预发布部署 (cd-staging.yml)
    ↓
main → 生产部署 (cd-production.yml)
```

### 状态检查
- 代码质量检查
- 单元测试
- 集成测试
- 安全扫描
- 依赖检查

## ⚠️ 重要注意事项

### 禁止操作
- ❌ 直接向 main 分支推送代码
- ❌ 跳过 PR 流程
- ❌ 在受保护分支上强制推送
- ❌ 合并未经测试的代码
- ❌ 保留已合并的 feature 分支

### 最佳实践
- ✅ 保持 feature 分支小而专注
- ✅ 及时删除已合并的分支
- ✅ 在预发布环境充分测试
- ✅ 编写清晰的提交信息
- ✅ 及时同步上游分支


## 📊 分支状态监控

### 健康检查
- 定期检查分支保护规则
- 监控 CI/CD 流水线状态
- 审查长期存在的 feature 分支
- 清理过期的分支

### 性能指标
- PR 合并时间
- 部署成功率
- 回滚频率
- 代码审查覆盖率

---

**记住**: 这个分支模型的核心是保证代码质量和部署安全。当有疑问时，选择更安全的方式，宁可多一步审查，也不要跳过流程。

