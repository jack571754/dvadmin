"""
测试博客 API 接口
"""
import requests
import json

BASE_URL = "http://localhost:9000"

def test_api():
    print("=" * 50)
    print("测试博客 API 接口")
    print("=" * 50)

    # 1. 测试分类列表
    print("\n[1] 测试分类列表 (GET /api/blog/categories/)")
    try:
        resp = requests.get(f"{BASE_URL}/api/blog/categories/", timeout=5)
        print(f"    状态码: {resp.status_code}")
        data = resp.json()
        print(f"    响应: {json.dumps(data, indent=4, ensure_ascii=False)[:200]}...")
    except Exception as e:
        print(f"    错误: {e}")

    # 2. 测试标签列表
    print("\n[2] 测试标签列表 (GET /api/blog/tags/)")
    try:
        resp = requests.get(f"{BASE_URL}/api/blog/tags/", timeout=5)
        print(f"    状态码: {resp.status_code}")
        data = resp.json()
        print(f"    响应: {json.dumps(data, indent=4, ensure_ascii=False)[:200]}...")
    except Exception as e:
        print(f"    错误: {e}")

    # 3. 测试文章列表
    print("\n[3] 测试文章列表 (GET /api/blog/articles/)")
    try:
        resp = requests.get(f"{BASE_URL}/api/blog/articles/", timeout=5)
        print(f"    状态码: {resp.status_code}")
        data = resp.json()
        print(f"    响应: {json.dumps(data, indent=4, ensure_ascii=False)[:200]}...")
    except Exception as e:
        print(f"    错误: {e}")

    # 4. 测试热门文章
    print("\n[4] 测试热门文章 (GET /api/blog/articles/hot/)")
    try:
        resp = requests.get(f"{BASE_URL}/api/blog/articles/hot/", timeout=5)
        print(f"    状态码: {resp.status_code}")
        data = resp.json()
        print(f"    响应: {json.dumps(data, indent=4, ensure_ascii=False)[:200]}...")
    except Exception as e:
        print(f"    错误: {e}")

    # 5. 测试用户注册
    print("\n[5] 测试用户注册 (POST /api/blog/register/)")
    try:
        import random
        username = f"testuser{random.randint(1000, 9999)}"
        payload = {
            "username": username,
            "password": "test123456",
            "confirm_password": "test123456",
            "email": f"{username}@example.com"
        }
        resp = requests.post(f"{BASE_URL}/api/blog/register/", json=payload, timeout=5)
        print(f"    用户名: {username}")
        print(f"    状态码: {resp.status_code}")
        data = resp.json()
        print(f"    响应: {json.dumps(data, indent=4, ensure_ascii=False)}")
    except Exception as e:
        print(f"    错误: {e}")

    # 6. 测试评论列表
    print("\n[6] 测试评论列表 (GET /api/blog/comments/)")
    try:
        resp = requests.get(f"{BASE_URL}/api/blog/comments/", timeout=5)
        print(f"    状态码: {resp.status_code}")
        data = resp.json()
        print(f"    响应: {json.dumps(data, indent=4, ensure_ascii=False)[:200]}...")
    except Exception as e:
        print(f"    错误: {e}")

    print("\n" + "=" * 50)
    print("测试完成！")
    print("=" * 50)

if __name__ == "__main__":
    test_api()
