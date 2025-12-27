#!/bin/bash

# Configuration
API_URL="http://localhost:3000/api"
EMAIL_SENDER="sender_$(date +%s)@test.com"
EMAIL_RECIPIENT="recipient_$(date +%s)@test.com"
PASSWORD="password123"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "Testing Message Sending"
echo "=========================================="

# 1. Register Recipient
echo -e "\n${GREEN}[1/4] Registering Recipient ($EMAIL_RECIPIENT)...${NC}"
RECIPIENT_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Recipient\",
    \"email\": \"$EMAIL_RECIPIENT\",
    \"password\": \"$PASSWORD\",
    \"role\": \"student\"
  }")

# Extract Recipient ID using grep/sed (assuming no jq)
# This is a bit fragile but works for simple JSON structures
if command -v jq &> /dev/null; then
    RECIPIENT_ID=$(echo $RECIPIENT_RESPONSE | jq -r '.user.id // .data.user.id')
else
    # Fallback to python for JSON parsing
    RECIPIENT_ID=$(echo $RECIPIENT_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('user', {}).get('id') or json.load(sys.stdin).get('user', {}).get('id'))" 2>/dev/null)
fi

echo "Recipient ID: $RECIPIENT_ID"

if [ -z "$RECIPIENT_ID" ] || [ "$RECIPIENT_ID" == "null" ]; then
    echo -e "${RED}Failed to get Recipient ID. Response: $RECIPIENT_RESPONSE${NC}"
    # Try logging in if user already exists
    LOGIN_RESP=$(curl -s -X POST "$API_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$EMAIL_RECIPIENT\",
        \"password\": \"$PASSWORD\"
      }")
    if command -v jq &> /dev/null; then
        RECIPIENT_ID=$(echo $LOGIN_RESP | jq -r '.user.id // .data.user.id')
    else
        RECIPIENT_ID=$(echo $LOGIN_RESP | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('user', {}).get('id'))" 2>/dev/null)
    fi
     echo "Retrieved Recipient ID from login: $RECIPIENT_ID"
fi


# 2. Register Sender
echo -e "\n${GREEN}[2/4] Registering Sender ($EMAIL_SENDER)...${NC}"
SENDER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Sender\",
    \"email\": \"$EMAIL_SENDER\",
    \"password\": \"$PASSWORD\",
    \"role\": \"teacher\"
  }")

# 3. Login Sender to get Token
echo -e "\n${GREEN}[3/4] Logging in Sender...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL_SENDER\",
    \"password\": \"$PASSWORD\"
  }")

if command -v jq &> /dev/null; then
    TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // .data.token')
else
    TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('token') or json.load(sys.stdin).get('data', {}).get('token'))")
fi

echo "Token: ${TOKEN:0:20}..."

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo -e "${RED}Failed to login sender. Response: $LOGIN_RESPONSE${NC}"
    exit 1
fi

# 4. Send Message
echo -e "\n${GREEN}[4/4] Sending Message to $RECIPIENT_ID...${NC}"
MESSAGE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"recipientId\": \"$RECIPIENT_ID\",
    \"type\": \"user\",
    \"content\": \"Hello, this is a test message\"
  }")

HTTP_CODE=$(echo "$MESSAGE_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$MESSAGE_RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
    echo -e "${GREEN}SUCCESS! Message sent.${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}FAILURE! Request failed with status $HTTP_CODE${NC}"
    echo "Response: $BODY"
fi
