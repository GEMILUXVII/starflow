<div align="center">
  <img src="public/favicon.svg" alt="Starflow Logo" width="160" />
</div>

# <div align="center">Starflow</div>

<div align="center">
  <strong>GitHub Stars 管理工具 | 让收藏更有条理</strong>
</div>

<br>

<div align="center">
  <a href="https://github.com/GEMILUXVII/starflow/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="License"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-5.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma"></a>
</div>

<div align="center">
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"></a>
</div>

<br>

<div align="center">
  <a href="#项目简介">项目简介</a> |
  <a href="#功能特性">功能特性</a> |
  <a href="#快速开始">快速开始</a> |
  <a href="#部署指南">部署指南</a> |
  <a href="#技术栈">技术栈</a>
</div>

---

## 项目简介

Starflow 是一个自托管的 GitHub Stars 管理工具，帮助你整理和管理在 GitHub 上收藏的仓库。当你的 Stars 数量达到数百甚至数千时，找到特定仓库变得困难，Starflow 通过分类、搜索、笔记等功能解决这个问题。

### 设计理念

- 极简黑白设计，专注内容本身
- 响应式布局，适配桌面与移动端
- 支持亮色/暗色主题切换
- 数据自托管，完全掌控

### 架构概览

```
用户请求 --> Next.js App Router --> Server Components
                                --> API Routes
                                --> Prisma ORM --> SQLite/PostgreSQL
```

## 功能特性

### 核心功能

- **分类管理**：创建自定义 Lists，将仓库按项目、技术栈或用途分类
- **快速搜索**：按名称、描述、语言快速筛选，找到你需要的仓库
- **双向同步**：与 GitHub 实时同步，取消 Star 也会同步到你的账号
- **笔记备注**：为仓库添加个人笔记，记录使用心得

### 数据管理

- **导入导出**：支持 JSON/CSV 格式导出，便于备份和迁移
- **批量操作**：批量添加仓库到 Lists
- **数据重置**：一键清除本地数据，重新同步

### 用户体验

- **深色/浅色模式**：一键切换，偏好自动保存
- **键盘快捷键**：支持常用操作的快捷键
- **响应式设计**：适配桌面、平板、移动端

## 快速开始

### 前置条件

- Node.js 20+
- pnpm（推荐）或 npm
- GitHub OAuth App

### 创建 GitHub OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写信息：
   - Application name: `Starflow`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. 记录 Client ID 和 Client Secret

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/GEMILUXVII/starflow.git
cd starflow

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入 GitHub OAuth 凭据和 NextAuth Secret

# 生成 Prisma 客户端
pnpm prisma generate

# 初始化数据库
pnpm prisma db push

# 启动开发服务器
pnpm dev
```

应用将在 `http://localhost:3000` 启动。

### 环境变量说明

| 变量名 | 说明 |
|--------|------|
| `DATABASE_URL` | 数据库连接字符串 |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `NEXTAUTH_SECRET` | NextAuth 签名密钥（使用 `openssl rand -base64 32` 生成） |
| `NEXTAUTH_URL` | 应用 URL（生产环境必填） |

## 部署指南

### Docker 部署（推荐）

#### 1. 准备环境变量

```bash
# 创建 .env 文件
cat > .env << 'EOF'
GITHUB_CLIENT_ID=你的GitHub_OAuth_Client_ID
GITHUB_CLIENT_SECRET=你的GitHub_OAuth_Client_Secret
NEXTAUTH_SECRET=使用openssl_rand_-base64_32生成
NEXTAUTH_URL=https://你的域名
EOF
```

#### 2. 构建并启动

```bash
# 使用 Docker Compose
docker compose up -d --build

# 初始化数据库
docker compose exec starflow npx prisma db push

# 查看日志
docker compose logs -f
```

#### 3. 常用命令

```bash
docker compose up -d      # 启动
docker compose down       # 停止
docker compose restart    # 重启
docker compose logs -f    # 查看日志
```

### 手动部署

#### 1. 安装依赖

```bash
# Rocky Linux / CentOS / RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
npm install -g pnpm pm2
```

#### 2. 构建应用

```bash
pnpm install
pnpm prisma generate
pnpm prisma db push
pnpm build
```

#### 3. 启动服务

```bash
pm2 start npm --name "starflow" -- start
pm2 save
pm2 startup
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 15.x | React 全栈框架 |
| React | 19.x | UI 库 |
| Tailwind CSS | 4.x | 原子化 CSS |
| Radix UI | - | 无障碍组件库 |
| Lucide | - | 图标库 |
| Zustand | 5.x | 状态管理 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js API Routes | - | API 接口 |
| NextAuth.js | 5.x | 身份认证 |
| Prisma | 5.x | ORM |
| SQLite | - | 默认数据库 |

## 项目结构

```
starflow/
├── prisma/
│   └── schema.prisma        # 数据库模型
├── public/
│   └── favicon.svg          # 网站图标
├── scripts/
│   └── deploy.sh            # 部署脚本
├── src/
│   ├── app/
│   │   ├── api/             # API 路由
│   │   │   ├── auth/        # 认证接口
│   │   │   ├── lists/       # Lists CRUD
│   │   │   ├── notes/       # 笔记接口
│   │   │   ├── repositories/ # 仓库接口
│   │   │   └── sync/        # 同步接口
│   │   ├── privacy/         # 隐私政策
│   │   ├── settings/        # 设置页
│   │   ├── stars/           # 主页面
│   │   ├── terms/           # 服务条款
│   │   ├── globals.css      # 全局样式
│   │   ├── layout.tsx       # 根布局
│   │   └── page.tsx         # 首页
│   ├── components/
│   │   ├── ui/              # 基础 UI 组件
│   │   └── ...              # 业务组件
│   └── lib/
│       ├── auth.ts          # 认证配置
│       └── prisma.ts        # 数据库客户端
├── .env.example             # 环境变量示例
├── docker-compose.yml       # Docker Compose 配置
├── Dockerfile               # Docker 镜像配置
├── next.config.ts           # Next.js 配置
├── package.json
└── tsconfig.json
```

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 发起 Pull Request

## 许可证

MIT License

Copyright (c) 2025 GEMILUXVII

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
