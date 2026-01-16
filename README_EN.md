<div align="center">
  <img src="public/favicon.svg" alt="Starflow Logo" width="160" />
</div>

# <div align="center">Starflow</div>

<div align="center">
  <strong>A self-hosted GitHub Stars manager</strong>
</div>

<br>

<div align="center">
  <a href="https://github.com/GEMILUXVII/starflow/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="License"></a>
  <a href="https://hub.docker.com/r/gemiluxvii/starflow"><img src="https://img.shields.io/badge/Docker-Hub-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Hub"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"></a>
</div>

<br>

<div align="center">
  <a href="#features">Features</a> |
  <a href="#quick-start">Quick Start</a> |
  <a href="#deployment">Deployment</a> |
  <a href="#development">Development</a> |
  <a href="CHANGELOG.md">Changelog</a>
</div>

<div align="center">
  <a href="README.md">中文</a> | <strong>English</strong>
</div>

---

## Features

- **List Management** - Create custom lists to organize repositories by project, tech stack, or purpose
- **Fast Search** - Filter by name, description, or language to find what you need
- **Two-way Sync** - Real-time sync with GitHub, unstar also syncs to your account
- **Notes** - Add personal notes to repositories
- **Import/Export** - Backup and migrate your data in JSON/CSV format
- **Dark/Light Mode** - Theme switching with auto-save preference

## Quick Start

### Using Docker (Recommended)

```bash
# Pull the image
docker pull gemiluxvii/starflow:latest

# Create .env file
cat > .env << 'EOF'
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=https://your-domain.com
EOF

# Download docker-compose.yml
curl -O https://raw.githubusercontent.com/GEMILUXVII/starflow/main/docker-compose.yml

# Start services
docker compose up -d

# Initialize database
docker compose exec starflow npx prisma db push --skip-generate
```

### Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Homepage URL: `https://your-domain.com`
   - Callback URL: `https://your-domain.com/api/auth/callback/github`

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `NEXTAUTH_SECRET` | Random secret (use `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your domain URL |

## Deployment

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
      - ./data/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U starflow"]
      interval: 5s
      timeout: 5s
      retries: 5
```

### Commands

```bash
docker compose up -d       # Start
docker compose down        # Stop
docker compose restart     # Restart
docker compose logs -f     # View logs
```

## Development

```bash
# Clone
git clone https://github.com/GEMILUXVII/starflow.git
cd starflow

# Install
pnpm install

# Configure
cp .env.example .env

# Database
pnpm prisma generate
pnpm prisma db push

# Run
pnpm dev
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, Radix UI
- **Backend**: Next.js API Routes, NextAuth.js 5, Prisma 5
- **Database**: PostgreSQL

## License

[MIT](LICENSE)
