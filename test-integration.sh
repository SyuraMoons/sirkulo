#!/bin/bash

# Integration Test Script for Sirkulo Frontend-Backend
# This script tests the basic integration between frontend and backend

echo "🚀 Starting Sirkulo Integration Tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:8081"

# Function to check if service is running
check_service() {
    local url=$1
    local service_name=$2
    
    echo -n "Checking $service_name... "
    if curl -s "$url/health" > /dev/null 2>&1 || curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    else
        echo -e "${RED}✗ Not running${NC}"
        return 1
    fi
}

# Function to test API endpoint
test_api() {
    local endpoint=$1
    local method=$2
    local description=$3
    local expected_status=$4
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BACKEND_URL$endpoint")
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ $response${NC}"
        return 0
    else
        echo -e "${RED}✗ $response (expected $expected_status)${NC}"
        return 1
    fi
}

# Function to test authentication flow
test_auth_flow() {
    echo -e "\n${YELLOW}Testing Authentication Flow...${NC}"
    
    # Test signup
    echo -n "Testing user signup... "
    signup_response=$(curl -s -X POST "$BACKEND_URL/api/auth/signup" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@example.com",
            "password": "testpassword123",
            "fullName": "Test User"
        }')
    
    if echo "$signup_response" | grep -q "success.*true\|accessToken\|email.*test@example.com"; then
        echo -e "${GREEN}✓ Signup successful${NC}"
        
        # Extract token if available
        token=$(echo "$signup_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$token" ]; then
            echo -e "${GREEN}✓ Token received${NC}"
            
            # Test authenticated endpoint
            echo -n "Testing authenticated endpoint... "
            auth_test=$(curl -s -H "Authorization: Bearer $token" "$BACKEND_URL/api/auth/me")
            
            if echo "$auth_test" | grep -q "email\|fullName"; then
                echo -e "${GREEN}✓ Authentication working${NC}"
            else
                echo -e "${RED}✗ Authentication failed${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}~ Signup may have failed (user might exist)${NC}"
        
        # Try login instead
        echo -n "Testing user login... "
        login_response=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
            -H "Content-Type: application/json" \
            -d '{
                "email": "test@example.com",
                "password": "testpassword123"
            }')
        
        if echo "$login_response" | grep -q "accessToken\|success.*true"; then
            echo -e "${GREEN}✓ Login successful${NC}"
        else
            echo -e "${RED}✗ Login failed${NC}"
        fi
    fi
}

# Main test execution
echo -e "\n${YELLOW}1. Checking Services Status...${NC}"

backend_running=false
frontend_running=false

if check_service "$BACKEND_URL" "Backend Server"; then
    backend_running=true
fi

if check_service "$FRONTEND_URL" "Frontend Server"; then
    frontend_running=true
fi

# Test backend endpoints if backend is running
if [ "$backend_running" = true ]; then
    echo -e "\n${YELLOW}2. Testing Backend API Endpoints...${NC}"
    
    test_api "/health" "GET" "Health check" "200"
    test_api "/api" "GET" "API info" "200"
    test_api "/api/listings" "GET" "Listings endpoint" "200"
    test_api "/api/ai/conversation-types" "GET" "AI conversation types" "200"
    
    # Test authentication flow
    test_auth_flow
    
    echo -e "\n${YELLOW}3. Testing Socket.IO Connection...${NC}"
    echo -n "Testing Socket.IO endpoint... "
    
    # Simple check for socket.io endpoint
    if curl -s "$BACKEND_URL/socket.io/" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Socket.IO endpoint accessible${NC}"
    else
        echo -e "${RED}✗ Socket.IO endpoint not accessible${NC}"
    fi
    
else
    echo -e "\n${RED}Backend server is not running. Please start it with:${NC}"
    echo "cd sirkulo-backend && npm run dev"
fi

# Test frontend if it's running
if [ "$frontend_running" = true ]; then
    echo -e "\n${YELLOW}4. Frontend Server Status...${NC}"
    echo -e "${GREEN}✓ Frontend development server is running${NC}"
    echo -e "Access the app at: ${FRONTEND_URL}"
else
    echo -e "\n${RED}Frontend server is not running. Please start it with:${NC}"
    echo "npm start"
fi

# Database and Redis checks
echo -e "\n${YELLOW}5. Checking Dependencies...${NC}"

# Check PostgreSQL
echo -n "Checking PostgreSQL... "
if command -v psql > /dev/null 2>&1; then
    if pg_isready > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is running${NC}"
    else
        echo -e "${RED}✗ PostgreSQL is not running${NC}"
    fi
else
    echo -e "${YELLOW}~ PostgreSQL client not found${NC}"
fi

# Check Redis
echo -n "Checking Redis... "
if command -v redis-cli > /dev/null 2>&1; then
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis is running${NC}"
    else
        echo -e "${RED}✗ Redis is not running${NC}"
    fi
else
    echo -e "${YELLOW}~ Redis client not found${NC}"
fi

# Summary
echo -e "\n${YELLOW}Integration Test Summary:${NC}"
echo "=================================="

if [ "$backend_running" = true ] && [ "$frontend_running" = true ]; then
    echo -e "${GREEN}✓ Both frontend and backend are running${NC}"
    echo -e "${GREEN}✓ Integration is ready for testing${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open the mobile app or web browser"
    echo "2. Test user registration/login"
    echo "3. Test cart functionality"
    echo "4. Test AI chat features"
elif [ "$backend_running" = true ]; then
    echo -e "${YELLOW}⚠ Backend is running, but frontend is not${NC}"
    echo "Start the frontend with: npm start"
elif [ "$frontend_running" = true ]; then
    echo -e "${YELLOW}⚠ Frontend is running, but backend is not${NC}"
    echo "Start the backend with: cd sirkulo-backend && npm run dev"
else
    echo -e "${RED}✗ Neither frontend nor backend is running${NC}"
    echo "Please start both services and run this test again"
fi

echo ""
echo "For detailed setup instructions, see: INTEGRATION_SETUP.md"