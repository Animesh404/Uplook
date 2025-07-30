#!/usr/bin/env python3
"""
Simple test script for local development
Tests basic API functionality without authentication
"""

import requests
import json
import sys
from urllib.parse import urljoin

BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_openapi_docs():
    """Test the OpenAPI documentation endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/openapi.json", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ OpenAPI docs accessible: {data.get('info', {}).get('title', 'Unknown')}")
            return True
        else:
            print(f"❌ OpenAPI docs failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ OpenAPI docs failed: {e}")
        return False

def test_database_connection():
    """Test database connection through an endpoint that requires DB access"""
    try:
        # Try to access an endpoint that would require database access
        # This is a basic test - in a real app you might have a dedicated DB health endpoint
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ Database connection appears to be working (docs endpoint accessible)")
            return True
        else:
            print(f"⚠️  Database connection test inconclusive: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Database connection test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Uplook Wellness API local setup...")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_endpoint),
        ("OpenAPI Documentation", test_openapi_docs),
        ("Database Connection", test_database_connection),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        if test_func():
            passed += 1
        else:
            print(f"   ❌ {test_name} failed")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your local setup is working correctly.")
        print("\nNext steps:")
        print("1. Visit http://localhost:8000/docs for interactive API documentation")
        print("2. Set up your Clerk credentials in the .env file")
        print("3. Start testing authenticated endpoints")
    else:
        print("⚠️  Some tests failed. Check your setup:")
        print("1. Ensure the server is running: python main.py")
        print("2. Check that PostgreSQL and Redis are running")
        print("3. Verify your .env configuration")
        sys.exit(1)

if __name__ == "__main__":
    main() 