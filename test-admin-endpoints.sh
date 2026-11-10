#!/bin/bash

# Admin Dashboard - API Endpoints Test
# This script verifies that all admin endpoints are working correctly

echo "=========================================="
echo "Admin Dashboard - API Endpoints Verification"
echo "=========================================="
echo ""

# Admin credentials
ADMIN_EMAIL="admin@marketplace.com"
ADMIN_PASSWORD="admin123"
API_BASE="http://localhost:5000/api"

echo "1. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
else
  echo "✅ Login successful"
  echo "Token: ${TOKEN:0:20}..."
fi

echo ""
echo "2. Testing Admin Endpoints..."

# Test each endpoint
declare -a ENDPOINTS=(
  "GET:$API_BASE/admin/dashboard:Dashboard Stats"
  "GET:$API_BASE/admin/providers:Providers List"
  "GET:$API_BASE/admin/customers:Customers List"
  "GET:$API_BASE/admin/bookings:Bookings List"
  "GET:$API_BASE/admin/categories:Categories List"
  "GET:$API_BASE/admin/reviews:Reviews List"
  "GET:$API_BASE/admin/analytics:Analytics Data"
  "GET:$API_BASE/admin/activity-logs:Activity Logs"
)

for endpoint in "${ENDPOINTS[@]}"; do
  IFS=":" read -r METHOD URL DESC <<< "$endpoint"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD "$URL" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ $DESC ($HTTP_CODE)"
  else
    echo "❌ $DESC ($HTTP_CODE)"
    echo "   Response: ${BODY:0:100}..."
  fi
done

echo ""
echo "=========================================="
echo "Verification Complete!"
echo "=========================================="
