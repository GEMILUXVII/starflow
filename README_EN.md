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
  <a href="#preview">Preview</a> |
  <a href="#features">Features</a> |
  <a href="#quick-start">Quick Start</a> |
  <a href="#ai-classification">AI Classification</a> |
  <a href="#development">Development</a> |
  <a href="CHANGELOG.md">Changelog</a>
</div>

<div align="center">
  <a href="README.md">中文</a> | <strong>English</strong>
</div>

---

## Preview

<details>
<summary>🌙 Dark Mode</summary>
<br>

![Main](public/preview/preview-darkmode-main.png)
![Stats](public/preview/preview-darkmode-stats.png)
![Settings](public/preview/preview-darkmode-settings.png)

</details>

<details>
<summary>☀️ Light Mode</summary>
<br>

![Main](public/preview/preview-whitemode-main.png)
![Stats](public/preview/preview-whitemode-stats.png)
![Settings](public/preview/preview-whitemode-settings.png)

</details>

---

## Features

### Core Features

- **Lists Management** - Create custom lists to organize repositories by project, tech stack, or purpose with 24 preset colors
- **AI Smart Classification** - Connect to OpenAI-compatible APIs for one-click automatic classification of all unorganized repositories
- **Two-way Sync** - Real-time sync with GitHub, unstar also syncs to your account
- **README Preview** - View repository README without leaving the app

### Search & Filter

- **Full-text Search** - Quickly search repositories by name or description
- **Multi-dimensional Filter** - Filter by language, list, star count, update time, etc.
- **Sorting Options** - Sort by star time, update time, star count, and more

### Data Management

- **Notes** - Add personal notes to repositories for future reference
- **Import/Export** - Backup and migrate your data in JSON/CSV format
- **Data Persistence** - PostgreSQL storage with data directory mapping for easy backup

### User Experience

- **Theme Switching** - Support for light/dark mode with auto-save preference
- **Keyboard Shortcuts** - Keyboard shortcuts for improved efficiency
- **Responsive Design** - Works on desktop and mobile

---

## Quick Start

### Using Docker (Recommended)

##### Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Homepage URL: `https://your-domain.com`
   - Callback URL: `https://your-domain.com/api/auth/callback/github`

##### Environment Variables

| Variable               | Description                                   |
| ---------------------- | --------------------------------------------- |
| `GITHUB_CLIENT_ID`     | GitHub OAuth App Client ID                    |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret                |
| `NEXTAUTH_SECRET`      | Random secret (use `openssl rand -base64 32`) |
| `NEXTAUTH_URL`         | Your domain URL                               |

##### Pull Image

```bash
docker pull gemiluxvii/starflow:latest
```

##### Create .env File

```bash
cat > .env << 'EOF'
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=https://your-domain.com
EOF
```

##### Write docker-compose.yml

- Fetch with curl

```bash
curl -O https://raw.githubusercontent.com/GEMILUXVII/starflow/main/docker-compose.yml
```

- Or copy the text below:

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

##### Start Services

```bash
docker compose up -d
```
##### Initialize Database

```bash
docker compose exec starflow npx prisma db push --skip-generate
```

Then you can access Starflow at http://serverip:3000

---

## AI Classification

Starflow supports OpenAI-compatible APIs for intelligent repository classification.

### Supported Services

- OpenAI Official API
- Third-party proxy services (auto-compatible with /v1 path)
- Self-hosted Ollama, LocalAI, etc.

### Configuration

1. Go to "Settings" page
2. In the "AI Classification" section, fill in:
   - API URL (e.g., `https://api.openai.com` or proxy URL)
   - API Key
   - Model name (e.g., `gpt-3.5-turbo`)
3. Click "Test Connection" to verify
4. Enable AI classification

### Classification Details

- 15 standard categories: AI Tools, Proxy Tools, CLI Tools, Frontend, Backend, Database, DevOps, Editor, Dev Tools, Download Tools, Media Tools, Security Tools, Learning Resources, System Tools, Other
- Supports single repository and batch classification
- Prioritizes matching existing lists to reduce duplicates

---

### Data Backup

Data is stored in `./data/postgres` directory. Backup this directory:

```bash
# Backup
tar -czvf starflow-backup.tar.gz ./data

# Migrate to new server
tar -xzvf starflow-backup.tar.gz
docker compose up -d
```

---

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

---

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, Radix UI
- **Backend**: Next.js API Routes, NextAuth.js 5, Prisma 5
- **Database**: PostgreSQL
- **AI**: OpenAI-compatible API

---

## License

[MIT](LICENSE)
