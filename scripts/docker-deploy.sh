#!/bin/bash

# ============================================================
#  Starflow Docker Deployment Script
#  For Rocky Linux / CentOS / RHEL / Debian / Ubuntu
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# ASCII Art Logo
echo -e "${PURPLE}"
cat << 'EOF'
  ____  _              __ _
 / ___|| |_ __ _ _ __ / _| | _____      __
 \___ \| __/ _` | '__| |_| |/ _ \ \ /\ / /
  ___) | || (_| | |  |  _| | (_) \ V  V /
 |____/ \__\__,_|_|  |_| |_|\___/ \_/\_/

EOF
echo -e "${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Docker Deployment Script${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# ============================================================
# Step 1: Check Docker
# ============================================================
echo -e "\n${PURPLE}[Step 1/5]${NC} Checking Docker..."

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    log_success "Docker installed: $DOCKER_VERSION"
else
    log_warn "Docker not found. Installing..."

    # Install Docker
    curl -fsSL https://get.docker.com | sh

    # Start Docker
    systemctl enable docker
    systemctl start docker

    log_success "Docker installed"
fi

# Check Docker Compose
if docker compose version &> /dev/null; then
    log_success "Docker Compose available"
else
    log_error "Docker Compose not found. Please install Docker Compose."
    exit 1
fi

# ============================================================
# Step 2: Configure Environment
# ============================================================
echo -e "\n${PURPLE}[Step 2/5]${NC} Configuring environment..."

if [ ! -f .env ]; then
    log_warn ".env file not found. Creating..."

    # Generate NEXTAUTH_SECRET
    SECRET=$(openssl rand -base64 32)

    cat > .env << EOF
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# NextAuth.js
NEXTAUTH_SECRET=$SECRET
NEXTAUTH_URL=http://localhost:3000
EOF

    log_success ".env file created with auto-generated NEXTAUTH_SECRET"
    echo ""
    echo -e "  ${YELLOW}Please edit .env file:${NC}"
    echo -e "  ${CYAN}vim .env${NC}"
    echo ""
    echo -e "  Required:"
    echo -e "  - ${CYAN}GITHUB_CLIENT_ID${NC}: Your GitHub OAuth App Client ID"
    echo -e "  - ${CYAN}GITHUB_CLIENT_SECRET${NC}: Your GitHub OAuth App Client Secret"
    echo -e "  - ${CYAN}NEXTAUTH_URL${NC}: Your domain (e.g., https://example.com)"
    echo ""
    read -p "Press Enter after you've configured .env file..."
else
    log_success ".env file exists"
fi

# Validate .env
source .env
if [ "$GITHUB_CLIENT_ID" = "your_github_client_id" ] || [ -z "$GITHUB_CLIENT_ID" ]; then
    log_error "Please configure GITHUB_CLIENT_ID in .env file"
    exit 1
fi

# ============================================================
# Step 3: Build and Start
# ============================================================
echo -e "\n${PURPLE}[Step 3/5]${NC} Building and starting containers..."

# Stop existing containers
docker compose down 2>/dev/null || true

# Build and start
docker compose up -d --build

log_success "Containers started"

# Wait for database to be ready
echo -e "\n${PURPLE}[Step 4/5]${NC} Waiting for database..."
sleep 5

# Check if db is healthy
for i in {1..30}; do
    if docker compose exec -T db pg_isready -U starflow &> /dev/null; then
        log_success "Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Database failed to start"
        exit 1
    fi
    echo -n "."
    sleep 1
done

# ============================================================
# Step 5: Initialize Database
# ============================================================
echo -e "\n${PURPLE}[Step 5/5]${NC} Initializing database..."

docker compose exec -T starflow prisma db push

log_success "Database initialized"

# ============================================================
# Done!
# ============================================================
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${CYAN}Application:${NC}  http://localhost:3000"
echo -e "  ${CYAN}Logs:${NC}         docker compose logs -f"
echo -e "  ${CYAN}Restart:${NC}      docker compose restart"
echo -e "  ${CYAN}Stop:${NC}         docker compose down"
echo ""
echo -e "${PURPLE}"
cat << 'EOF'
  ╔═══════════════════════════════════════════════╗
  ║  Next steps:                                  ║
  ║  1. Configure Nginx reverse proxy             ║
  ║  2. Setup SSL with Let's Encrypt              ║
  ║  3. Update NEXTAUTH_URL in .env               ║
  ║  4. Run: docker compose restart               ║
  ╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"
