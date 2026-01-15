<div align="center">
  <img src="public/favicon.svg" alt="Starflow Logo" width="160" />
</div>

# <div align="center">Starflow</div>

<div align="center">
  <strong>自托管的 GitHub Stars 管理工具 | A self-hosted GitHub Stars manager</strong>
</div>

<br>

<div align="center">
  <a href="https://github.com/GEMILUXVII/starflow/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="License"></a>
  <a href="https://hub.docker.com/r/gemiluxvii/starflow"><img src="https://img.shields.io/badge/Docker-Hub-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Hub"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"></a>
</div>

<br>

<div align="center">
  <a href="#功能特性">功能特性</a> |
  <a href="#快速开始">快速开始</a> |
  <a href="#部署">部署</a> |
  <a href="#开发">开发</a> |
  <a href="CHANGELOG.md">更新日志</a>
</div>

<div align="center">
  <strong>中文</strong> | <a href="README_EN.md">English</a>
</div>

---

## 功能特性

- **分类管理** - 创建自定义 Lists，将仓库按项目、技术栈或用途分类
- **快速搜索** - 按名称、描述、语言快速筛选，找到你需要的仓库
- **双向同步** - 与 GitHub 实时同步，取消 Star 也会同步到你的账号
- **笔记备注** - 为仓库添加个人笔记，记录使用心得
- **导入导出** - 支持 JSON/CSV 格式导出，便于备份和迁移
- **主题切换** - 支持亮色/暗色模式，偏好自动保存

## 快速开始

### 使用 Docker（推荐）

```bash
# 拉取镜像
docker pull gemiluxvii/starflow:latest

# 创建 .env 文件
cat > .env << 'EOF'
GITHUB_CLIENT_ID=你的GitHub_Client_ID
GITHUB_CLIENT_SECRET=你的GitHub_Client_Secret
NEXTAUTH_SECRET=随机密钥
NEXTAUTH_URL=https://你的域名
EOF

# 下载 docker-compose.yml
curl -O https://raw.githubusercontent.com/GEMILUXVII/starflow/main/docker-compose.yml

# 启动服务
docker compose up -d

# 初始化数据库
docker compose exec starflow npx prisma db push --skip-generate
```

### 创建 GitHub OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写信息：
   - Homepage URL: `https://你的域名`
   - Callback URL: `https://你的域名/api/auth/callback/github`

### 环境变量

| 变量 | 说明 |
|------|------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `NEXTAUTH_SECRET` | 随机密钥（使用 `openssl rand -base64 32` 生成） |
| `NEXTAUTH_URL` | 应用域名 |

## 部署

### Docker Compose

```yaml
services:
  starflow:
    image: gemiluxvii/starflow:latest
    container_name: starflow
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://starflow:starflow@db:5432/starflow
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    container_name: starflow-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=starflow
      - POSTGRES_PASSWORD=starflow
      - POSTGRES_DB=starflow
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U starflow"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### 常用命令

```bash
docker compose up -d       # 启动
docker compose down        # 停止
docker compose restart     # 重启
docker compose logs -f     # 查看日志
```

## 开发

```bash
# 克隆仓库
git clone https://github.com/GEMILUXVII/starflow.git
cd starflow

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env

# 初始化数据库
pnpm prisma generate
pnpm prisma db push

# 启动开发服务器
pnpm dev
```

## 技术栈

- **前端**: Next.js 15, React 19, Tailwind CSS 4, Radix UI
- **后端**: Next.js API Routes, NextAuth.js 5, Prisma 5
- **数据库**: PostgreSQL

## 许可证

[MIT](LICENSE)
