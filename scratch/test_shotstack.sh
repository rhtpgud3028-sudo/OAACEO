#!/bin/bash
# Shotstack API Test Script
# Usage: ./test_shotstack.sh YOUR_API_KEY

API_KEY="${1:-YOUR_API_KEY}"
STAGE_URL="https://api.shotstack.io/stage/render"

echo "🚀 Testing Shotstack API..."
echo ""

# Read template
TEMPLATE=$(cat shotstack_test_template.json)

# Make API request
RESPONSE=$(curl -s -X POST "$STAGE_URL" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$TEMPLATE")

echo "📤 API Response:"
echo "$RESPONSE" | python -m json.tool 2>/dev/null || echo "$RESPONSE"

# Extract render ID
RENDER_ID=$(echo "$RESPONSE" | python -c "import sys,json; print(json.load(sys.stdin)['response']['id'])" 2>/dev/null)

if [ -n "$RENDER_ID" ]; then
  echo ""
  echo "✅ Render ID: $RENDER_ID"
  echo ""
  echo "⏳ Checking status in 10 seconds..."
  sleep 10
  
  STATUS_RESPONSE=$(curl -s -X GET "https://api.shotstack.io/stage/render/$RENDER_ID" \
    -H "x-api-key: $API_KEY")
  
  echo "📊 Status Response:"
  echo "$STATUS_RESPONSE" | python -m json.tool 2>/dev/null || echo "$STATUS_RESPONSE"
else
  echo "❌ Failed to get render ID"
fi
