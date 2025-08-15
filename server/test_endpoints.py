#!/usr/bin/env python3
"""
Simple test script to verify API endpoints are working
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(method, endpoint, data=None, expected_status=200):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n🧪 Testing {method} {endpoint}")
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == expected_status:
            print(f"   ✅ Success")
            if response.content:
                try:
                    result = response.json()
                    print(f"   📄 Response: {json.dumps(result, indent=2)[:200]}...")
                except:
                    print(f"   📄 Response: {response.text[:100]}...")
            return True
        else:
            print(f"   ❌ Expected {expected_status}, got {response.status_code}")
            print(f"   📄 Error: {response.text}")
            return False
    
    except Exception as e:
        print(f"   💥 Exception: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting API endpoint tests...")
    
    # Test basic endpoints (no auth required)
    tests = [
        ("GET", "/", None, 200),
        ("GET", "/health", None, 200),
        ("GET", "/content/categories/", None, 200),
        ("GET", "/content/types/", None, 200),
    ]
    
    # Test content endpoints
    content_tests = [
        ("GET", "/content/1", None, 200),
        ("GET", "/content/2", None, 200),
    ]
    
    # Test home endpoints (these might fail without auth, but let's see)
    home_tests = [
        ("GET", "/home/agenda", None, 401),  # Should fail without auth
    ]
    
    all_tests = tests + content_tests + home_tests
    
    passed = 0
    total = len(all_tests)
    
    for method, endpoint, data, expected_status in all_tests:
        if test_endpoint(method, endpoint, data, expected_status):
            passed += 1
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed - check the output above")

if __name__ == "__main__":
    main()
