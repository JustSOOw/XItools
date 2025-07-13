# Docker镜像标签格式修复

## 🐛 问题描述

GitHub Actions部署工作流失败，错误信息：
```
ERROR: failed to build: invalid tag "ghcr.io/JustSOOw/XItools/frontend:staging": repository name must be lowercase
```

## 🔍 根本原因

GitHub Container Registry (ghcr.io) 要求仓库名称必须全部小写，但我们的GitHub仓库名称包含大写字母：
- 仓库名称：`JustSOOw/XItools`
- 问题镜像标签：`ghcr.io/JustSOOw/XItools/frontend:staging`

## ✅ 解决方案

在CI/CD工作流中添加名称转换逻辑，将仓库名称转换为小写：

### 修复前
```yaml
docker build -t ghcr.io/${{ github.repository }}/frontend:staging ./frontend --target production
docker push ghcr.io/${{ github.repository }}/frontend:staging
```

### 修复后
```yaml
# 将仓库名称转换为小写以符合GitHub Container Registry要求
REPO_LOWERCASE=$(echo "${{ github.repository }}" | tr '[:upper:]' '[:lower:]')

docker build -t ghcr.io/${REPO_LOWERCASE}/frontend:staging ./frontend --target production
docker push ghcr.io/${REPO_LOWERCASE}/frontend:staging
```

## 📋 修复的文件

1. **`.github/workflows/cd-staging.yml`** - 预生产环境部署
2. **`.github/workflows/cd-production.yml`** - 生产环境部署

## 🧪 验证方法

修复后，Docker镜像标签将变为：
- 原始：`ghcr.io/JustSOOw/XItools/frontend:staging`
- 修复后：`ghcr.io/justsoow/xitools/frontend:staging`

## 📝 技术说明

使用bash命令 `tr '[:upper:]' '[:lower:]'` 将字符串转换为小写：
- `${{ github.repository }}` 返回 `JustSOOw/XItools`
- `tr '[:upper:]' '[:lower:]'` 转换为 `justsoow/xitools`
- 最终镜像标签：`ghcr.io/justsoow/xitools/frontend:staging`

这个修复确保了Docker镜像能够成功推送到GitHub Container Registry。
