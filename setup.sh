#!/bin/bash

# Nijjara ERP Setup Script
# This script helps with initial project setup

set -e  # Exit on error

echo "=========================================="
echo "  Nijjara ERP Setup"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed. Please install Git first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js and Git are installed${NC}"
echo ""

# Install npm dependencies
echo "Installing npm dependencies..."
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Check Git configuration
echo "Checking Git configuration..."
GIT_USER=$(git config user.name || echo "")
GIT_EMAIL=$(git config user.email || echo "")

if [ -z "$GIT_USER" ] || [ -z "$GIT_EMAIL" ]; then
    echo -e "${YELLOW}⚠ Git user information not configured${NC}"
    echo "Please set your Git user information:"
    echo "  git config --global user.name \"Your Name\""
    echo "  git config --global user.email \"your.email@example.com\""
    echo ""
else
    echo -e "${GREEN}✓ Git user: $GIT_USER <$GIT_EMAIL>${NC}"
fi

# Check Git credential helper
CRED_HELPER=$(git config credential.helper || echo "")
if [ -z "$CRED_HELPER" ]; then
    echo -e "${YELLOW}⚠ Git credential helper not configured${NC}"
    echo ""
    echo "To avoid entering credentials every time, you can configure Git credential storage:"
    echo ""
    echo -e "${YELLOW}Option 1: Store credentials (simple)${NC}"
    echo "  git config --global credential.helper store"
    echo ""
    echo -e "${YELLOW}Option 2: Cache credentials for 1 hour${NC}"
    echo "  git config --global credential.helper 'cache --timeout=3600'"
    echo ""
    echo -e "${YELLOW}Option 3: Use SSH keys (most secure)${NC}"
    echo "  See README.md for SSH setup instructions"
    echo ""
else
    echo -e "${GREEN}✓ Git credential helper configured: $CRED_HELPER${NC}"
fi

echo ""
echo "=========================================="
echo "  Next Steps"
echo "=========================================="
echo ""
echo "1. Configure Google Apps Script (clasp):"
echo "   npx clasp login"
echo ""
echo "2. For a NEW project:"
echo "   npx clasp create --type standalone --title \"Nijjara ERP\""
echo ""
echo "   For an EXISTING project:"
echo "   Make sure you have a .clasp.json file with the script ID"
echo ""
echo "3. Push code to Apps Script:"
echo "   npm run push"
echo ""
echo "4. Deploy to both Apps Script and GitHub:"
echo "   npm run deploy"
echo ""
echo "5. Check project status:"
echo "   npm run status"
echo ""
echo -e "${GREEN}Setup complete! See README.md for more information.${NC}"
