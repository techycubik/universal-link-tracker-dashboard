#!/bin/bash

# Deployment Verification Script
# Usage: ./scripts/verify-deployment.sh https://your-dashboard.com [password]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DASHBOARD_URL="${1:-http://localhost:3000}"
PASSWORD="${2:-}"

echo -e "${YELLOW}=== Dashboard Deployment Verification ===${NC}"
echo "Testing: $DASHBOARD_URL"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}[1/5] Testing health check endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${DASHBOARD_URL}/api/health" || echo "000")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)

if [ "$HEALTH_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "$HEALTH_RESPONSE" | head -n -1 | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE" | head -n -1
else
    echo -e "${RED}✗ Health check failed (HTTP $HEALTH_CODE)${NC}"
    exit 1
fi
echo ""

# Test 2: Homepage loads
echo -e "${YELLOW}[2/5] Testing homepage...${NC}"
HOME_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DASHBOARD_URL" || echo "000")

if [ "$HOME_CODE" = "200" ] || [ "$HOME_CODE" = "307" ] || [ "$HOME_CODE" = "308" ]; then
    echo -e "${GREEN}✓ Homepage accessible (HTTP $HOME_CODE)${NC}"
else
    echo -e "${RED}✗ Homepage not accessible (HTTP $HOME_CODE)${NC}"
    exit 1
fi
echo ""

# Test 3: Static assets
echo -e "${YELLOW}[3/5] Testing static assets...${NC}"
FAVICON_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${DASHBOARD_URL}/favicon.ico" || echo "000")

if [ "$FAVICON_CODE" = "200" ] || [ "$FAVICON_CODE" = "304" ]; then
    echo -e "${GREEN}✓ Static assets loading${NC}"
else
    echo -e "${YELLOW}⚠ Static assets may have issues (HTTP $FAVICON_CODE)${NC}"
fi
echo ""

# Test 4: API endpoints (unauthenticated)
echo -e "${YELLOW}[4/5] Testing API endpoints...${NC}"
STATS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${DASHBOARD_URL}/api/stats/overview" || echo "000")

if [ "$STATS_CODE" = "401" ]; then
    echo -e "${GREEN}✓ API authentication working (returns 401 as expected)${NC}"
elif [ "$STATS_CODE" = "200" ]; then
    echo -e "${YELLOW}⚠ API returned 200 (authentication may be disabled)${NC}"
else
    echo -e "${RED}✗ API endpoint error (HTTP $STATS_CODE)${NC}"
fi
echo ""

# Test 5: Authentication (if password provided)
if [ -n "$PASSWORD" ]; then
    echo -e "${YELLOW}[5/5] Testing authentication...${NC}"

    AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DASHBOARD_URL}/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"password\":\"$PASSWORD\"}" || echo "000")

    AUTH_CODE=$(echo "$AUTH_RESPONSE" | tail -n 1)

    if [ "$AUTH_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Authentication successful${NC}"
    else
        echo -e "${RED}✗ Authentication failed (HTTP $AUTH_CODE)${NC}"
        echo "$AUTH_RESPONSE" | head -n -1
        exit 1
    fi
else
    echo -e "${YELLOW}[5/5] Skipping authentication test (no password provided)${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}=== Deployment Verification Complete ===${NC}"
echo -e "${GREEN}All critical checks passed!${NC}"
echo ""
echo "Dashboard URL: $DASHBOARD_URL"
echo "Health endpoint: ${DASHBOARD_URL}/api/health"
echo ""
echo "Next steps:"
echo "  1. Test login via browser"
echo "  2. Verify DynamoDB connectivity"
echo "  3. Check dashboard functionality"
echo "  4. Review logs for errors"
echo ""
