#!/bin/bash
# Test script for new OLA Maps API key
# Usage: ./test_new_api_key.sh YOUR_NEW_API_KEY

if [ -z "$1" ]; then
    echo "Usage: ./test_new_api_key.sh YOUR_NEW_API_KEY"
    exit 1
fi

API_KEY="$1"
echo "Testing OLA Maps API key: ${API_KEY:0:10}..."

# Test different endpoints
echo "Testing autocomplete endpoint..."
curl -s "https://api.olamaps.io/places/v1/autocomplete?input=kolkata&api_key=$API_KEY" | head -c 200
echo ""

echo "Testing with different parameter format..."
curl -s "https://api.olamaps.io/places/v1/autocomplete?input=kolkata&key=$API_KEY" | head -c 200
echo ""
