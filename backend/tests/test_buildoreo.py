"""Backend tests for Buildoreo e-commerce app"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

ADMIN_EMAIL = "admin@buildoreo.com"
ADMIN_PASSWORD = "admin123"
TEST_USER_EMAIL = "TEST_user_auto@buildoreo.com"
TEST_USER_PASSWORD = "testpass123"


@pytest.fixture(scope="module")
def admin_token():
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    return resp.json()["token"]

@pytest.fixture(scope="module")
def user_token():
    # Try to register first
    requests.post(f"{BASE_URL}/api/auth/register", json={"name": "Test User", "email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD})
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD})
    assert resp.status_code == 200
    return resp.json()["token"]

@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}

@pytest.fixture(scope="module")
def user_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}


# Auth tests
class TestAuth:
    def test_admin_login_success(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert data["user"]["role"] == "admin"

    def test_register_new_user(self):
        import uuid
        email = f"TEST_reg_{uuid.uuid4().hex[:8]}@test.com"
        resp = requests.post(f"{BASE_URL}/api/auth/register", json={"name": "Test Reg", "email": email, "password": "pass123"})
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert data["user"]["email"] == email.lower()

    def test_login_invalid(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "wrong@wrong.com", "password": "wrongpass"})
        assert resp.status_code == 401

    def test_me_endpoint(self, admin_headers):
        resp = requests.get(f"{BASE_URL}/api/auth/me", headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["role"] == "admin"


# Product tests
class TestProducts:
    def test_get_products(self):
        resp = requests.get(f"{BASE_URL}/api/products")
        assert resp.status_code == 200
        data = resp.json()
        assert "products" in data
        assert len(data["products"]) > 0

    def test_get_products_by_category(self):
        resp = requests.get(f"{BASE_URL}/api/products?category=Microcontrollers")
        assert resp.status_code == 200
        data = resp.json()
        for p in data["products"]:
            assert p["category"] == "Microcontrollers"

    def test_search_products(self):
        resp = requests.get(f"{BASE_URL}/api/products?search=Arduino")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["products"]) > 0

    def test_get_categories(self):
        resp = requests.get(f"{BASE_URL}/api/categories")
        assert resp.status_code == 200
        data = resp.json()
        assert "categories" in data
        assert len(data["categories"]) >= 7

    def test_get_product_detail(self):
        # Get a product first
        resp = requests.get(f"{BASE_URL}/api/products")
        product_id = resp.json()["products"][0]["id"]
        resp2 = requests.get(f"{BASE_URL}/api/products/{product_id}")
        assert resp2.status_code == 200
        assert resp2.json()["id"] == product_id

    def test_featured_products(self):
        resp = requests.get(f"{BASE_URL}/api/products?featured=true")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["products"]) > 0


# Admin product CRUD
class TestAdminProducts:
    created_product_id = None

    def test_admin_create_product(self, admin_headers):
        payload = {
            "name": "TEST_Product Auto",
            "description": "Test product for automation",
            "price": 999.0,
            "category": "Microcontrollers",
            "stock": 50,
            "image_url": "https://example.com/img.jpg",
            "brand": "TestBrand",
            "featured": False
        }
        resp = requests.post(f"{BASE_URL}/api/admin/products", json=payload, headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "TEST_Product Auto"
        TestAdminProducts.created_product_id = data["id"]

    def test_admin_get_products(self, admin_headers):
        resp = requests.get(f"{BASE_URL}/api/admin/products", headers=admin_headers)
        assert resp.status_code == 200
        assert "products" in resp.json()

    def test_admin_update_product(self, admin_headers):
        pid = TestAdminProducts.created_product_id
        if not pid:
            pytest.skip("No product created")
        resp = requests.put(f"{BASE_URL}/api/admin/products/{pid}", json={"price": 1099.0}, headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["price"] == 1099.0

    def test_admin_delete_product(self, admin_headers):
        pid = TestAdminProducts.created_product_id
        if not pid:
            pytest.skip("No product created")
        resp = requests.delete(f"{BASE_URL}/api/admin/products/{pid}", headers=admin_headers)
        assert resp.status_code == 200


# Payment & Order tests
class TestOrders:
    def test_create_payment_order(self, user_headers):
        resp = requests.post(f"{BASE_URL}/api/payment/create-order", json={"amount": 50000, "currency": "INR"}, headers=user_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert data.get("demo") == True  # demo mode

    def test_create_order(self, user_headers):
        # Create payment order first
        pay_resp = requests.post(f"{BASE_URL}/api/payment/create-order", json={"amount": 50000, "currency": "INR"}, headers=user_headers)
        order_id = pay_resp.json()["id"]
        
        resp = requests.post(f"{BASE_URL}/api/orders", json={
            "items": [{"product_id": "abc123", "name": "Test Product", "price": 499.0, "quantity": 1, "image_url": "https://example.com/img.jpg"}],
            "total_amount": 499.0,
            "shipping_address": {"name": "Test User", "phone": "9876543210", "address": "123 Test St", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"},
            "razorpay_order_id": order_id,
            "razorpay_payment_id": "pay_demo_test",
            "razorpay_signature": "demo_signature"
        }, headers=user_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "paid"

    def test_get_my_orders(self, user_headers):
        resp = requests.get(f"{BASE_URL}/api/orders/me", headers=user_headers)
        assert resp.status_code == 200
        assert "orders" in resp.json()


# Admin stats and users
class TestAdmin:
    def test_admin_stats(self, admin_headers):
        resp = requests.get(f"{BASE_URL}/api/admin/stats", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "total_products" in data
        assert "total_orders" in data
        assert "total_users" in data

    def test_admin_get_users(self, admin_headers):
        resp = requests.get(f"{BASE_URL}/api/admin/users", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "users" in data

    def test_admin_get_orders(self, admin_headers):
        resp = requests.get(f"{BASE_URL}/api/admin/orders", headers=admin_headers)
        assert resp.status_code == 200
        assert "orders" in resp.json()

    def test_non_admin_blocked(self, user_headers):
        resp = requests.get(f"{BASE_URL}/api/admin/stats", headers=user_headers)
        assert resp.status_code == 403
