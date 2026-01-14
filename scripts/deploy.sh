#!/bin/bash

# ============================================================
#  Starflow Deployment Script
#  For Rocky Linux / CentOS / RHEL
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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
echo -e "${CYAN}  GitHub Star Manager - Deployment Script${NC}"
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

check_command() {
    if command -v $1 &> /dev/null; then
        log_success "$1 is installed"
        return 0
    else
        return 1
    fi
}

# ============================================================
# Step 1: Check System
# ============================================================
echo -e "\n${PURPLE}[Step 1/7]${NC} Checking system requirements..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_warn "Running as root. Consider using a non-root user for production."
fi

# Check OS
if [ -f /etc/rocky-release ] || [ -f /etc/centos-release ] || [ -f /etc/redhat-release ]; then
    log_success "Compatible OS detected"
else
    log_warn "This script is optimized for Rocky/CentOS/RHEL. Proceeding anyway..."
fi

# ============================================================
# Step 2: Install Node.js
# ============================================================
echo -e "\n${PURPLE}[Step 2/7]${NC} Checking Node.js..."

if check_command node; then
    NODE_VERSION=$(node -v)
    log_info "Node.js version: $NODE_VERSION"
else
    log_info "Installing Node.js 20.x..."
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo dnf install -y nodejs
    log_success "Node.js installed"
fi

# ============================================================
# Step 3: Install pnpm
# ============================================================
echo -e "\n${PURPLE}[Step 3/7]${NC} Checking pnpm..."

if check_command pnpm; then
    PNPM_VERSION=$(pnpm -v)
    log_info "pnpm version: $PNPM_VERSION"
else
    log_info "Installing pnpm..."
    npm install -g pnpm
    log_success "pnpm installed"
fi

# ============================================================
# Step 4: Install Dependencies
# ============================================================
echo -e "\n${PURPLE}[Step 4/7]${NC} Installing project dependencies..."

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"
log_info "Working directory: $PROJECT_ROOT"

pnpm install --frozen-lockfile
log_success "Dependencies installed"

# ============================================================
# Step 5: Configure Environment
# ============================================================
echo -e "\n${PURPLE}[Step 5/7]${NC} Configuring environment..."

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        log_warn ".env file created from .env.example"
        log_warn "Please edit .env file with your configuration:"
        echo ""
        echo -e "  ${CYAN}GITHUB_CLIENT_ID${NC}     - Your GitHub OAuth App Client ID"
        echo -e "  ${CYAN}GITHUB_CLIENT_SECRET${NC} - Your GitHub OAuth App Client Secret"
        echo -e "  ${CYAN}NEXTAUTH_SECRET${NC}      - Random secret (generate with: openssl rand -base64 32)"
        echo -e "  ${CYAN}NEXTAUTH_URL${NC}         - Your domain (e.g., https://starflow.example.com)"
        echo ""

        # Generate NEXTAUTH_SECRET if not set
        read -p "Would you like to generate NEXTAUTH_SECRET automatically? [Y/n] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
            SECRET=$(openssl rand -base64 32)
            sed -i "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$SECRET\"/" .env
            log_success "NEXTAUTH_SECRET generated"
        fi

        log_warn "Please configure .env before continuing!"
        read -p "Press Enter after you've configured .env file..."
    else
        log_error ".env.example not found!"
        exit 1
    fi
else
    log_success ".env file exists"
fi

# ============================================================
# Step 6: Setup Database
# ============================================================
echo -e "\n${PURPLE}[Step 6/7]${NC} Setting up database..."

# Generate Prisma client
pnpm prisma generate
log_success "Prisma client generated"

# Push database schema
pnpm prisma db push
log_success "Database schema pushed"

# ============================================================
# Step 7: Build & Start
# ============================================================
echo -e "\n${PURPLE}[Step 7/7]${NC} Building application..."

pnpm build
log_success "Build completed"

# Install PM2 if not exists
if ! check_command pm2; then
    log_info "Installing PM2..."
    npm install -g pm2
fi

# Stop existing instance if running
pm2 delete starflow 2>/dev/null || true

# Start application
log_info "Starting application..."
pm2 start npm --name "starflow" -- start

# Save PM2 process list
pm2 save

# Setup PM2 startup script
log_info "Setting up PM2 startup..."
pm2 startup | tail -n 1 | bash 2>/dev/null || log_warn "Run 'pm2 startup' manually if needed"

# ============================================================
# Done!
# ============================================================
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${CYAN}Application:${NC} http://localhost:3000"
echo -e "  ${CYAN}PM2 Status:${NC}  pm2 status"
echo -e "  ${CYAN}PM2 Logs:${NC}    pm2 logs starflow"
echo -e "  ${CYAN}Restart:${NC}     pm2 restart starflow"
echo ""
echo -e "${PURPLE}"
cat << 'EOF'
  ╔═══════════════════════════════════════════╗
  ║  Don't forget to:                         ║
  ║  1. Configure reverse proxy (nginx)       ║
  ║  2. Setup SSL certificate (Let's Encrypt) ║
  ║  3. Configure firewall                    ║
  ╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"
