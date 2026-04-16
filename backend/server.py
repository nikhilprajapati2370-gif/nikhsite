
import random
from email.message import EmailMessage
import os
import bcrypt 
import jwt 
import razorpay 
import uuid
import hmac
import hashlib
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Optional, Annotated
from bson import ObjectId # type: ignore
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header # type: ignore
from fastapi.middleware.cors import CORSMiddleware 
from motor.motor_asyncio import AsyncIOMotorClient 
from pydantic import BaseModel, Field, BeforeValidator 
from dotenv import load_dotenv # type: ignore
import logging

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
JWT_SECRET = os.environ.get('JWT_SECRET', 'buildoreo_default_secret_key_2024')
JWT_ALGORITHM = "HS256"

rzp_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET and not RAZORPAY_KEY_ID.startswith('placeholder'):
    try:
        rzp_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    except Exception as e:
        logging.warning(f"Razorpay init failed: {e}")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
api_router = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(str)]


# ── Auth Helpers ─────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def send_otp_email(to_email: str, otp: str):
    print("STEP 1: Function called")
    print("Sending OTP to:", to_email)

    message = Mail(
        from_email=os.environ["EMAIL_FROM"],
        to_emails=to_email,
        subject="Buildoreo Password Reset OTP",
        plain_text_content=f"Your OTP is: {otp}"
    )

    try:
        sg = SendGridAPIClient(os.environ["SENDGRID_API_KEY"])
        response = sg.send(message)

        print("STEP 2: SendGrid Response")
        print("STATUS:", response.status_code)
        print("BODY:", response.body)

    except Exception as e:
        print("EMAIL ERROR:", str(e))


    




# ── Models ────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str



class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    stock: int
    image_url: str
    brand: str
    featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    brand: Optional[str] = None
    featured: Optional[bool] = None

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image_url: str

class ShippingAddress(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total_amount: float
    shipping_address: ShippingAddress
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class PaymentOrderCreate(BaseModel):
    amount: int
    currency: str = "INR"
    receipt: str = ""

class OrderStatusUpdate(BaseModel):
    status: str


# ── Auth Endpoints ─────────────────────────────────────────────────────────
@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    email = data.email.lower().strip()

    print("Sending OTP to:", email)

    user = await db.users.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = str(random.randint(100000, 999999))
    expiry = datetime.now(timezone.utc) + timedelta(minutes=10)

    await db.users.update_one(
        {"email": email},
        {"$set": {"reset_otp": otp, "otp_expiry": expiry.isoformat()}}
    )

    await send_otp_email(email, otp)

    return {"message": "OTP sent to email"}



@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    user = await db.users.find_one({"email": data.email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("reset_otp") != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    expiry = datetime.fromisoformat(user["otp_expiry"])
    if datetime.now(timezone.utc) > expiry:
        raise HTTPException(status_code=400, detail="OTP expired")

    new_hash = hash_password(data.new_password)

    await db.users.update_one(
        {"email": data.email},
        {"$set": {"password_hash": new_hash},
         "$unset": {"reset_otp": "", "otp_expiry": ""}}
    )

    return {"message": "Password reset successful"}

@api_router.post("/auth/register")
async def register(data: UserRegister):
    email = data.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        "name": data.name, "email": email,
        "password_hash": hash_password(data.password),
        "role": "user", "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_token(user_id, email, "user")
    return {"token": token, "user": {"id": user_id, "name": data.name, "email": email, "role": "user"}}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_id = str(user["_id"])
    token = create_token(user_id, email, user.get("role", "user"))
    return {"token": token, "user": {"id": user_id, "name": user["name"], "email": email, "role": user.get("role", "user")}}

@api_router.get("/auth/me")
async def me(current_user: dict = Depends(get_current_user)):
    return current_user


# ── Product Endpoints ──────────────────────────────────────────────────────

@api_router.get("/products")
async def get_products(
    category: Optional[str] = None, search: Optional[str] = None,
    featured: Optional[bool] = None, sort: Optional[str] = None,
    page: int = 1, limit: int = 20
):
    query = {}
    if category and category != "all":
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}}
        ]
    if featured is not None:
        query["featured"] = featured

    sort_opts = [("created_at", -1)]
    if sort == "price_asc": sort_opts = [("price", 1)]
    elif sort == "price_desc": sort_opts = [("price", -1)]
    elif sort == "rating": sort_opts = [("rating", -1)]

    skip = (page - 1) * limit
    total = await db.products.count_documents(query)
    fields = {"_id": 1, "name": 1, "price": 1, "category": 1, "image_url": 1, "brand": 1, "rating": 1, "reviews_count": 1, "featured": 1, "stock": 1}
    products = await db.products.find(query, fields).sort(sort_opts).skip(skip).limit(limit).to_list(limit)
    result = []
    for p in products:
        p["id"] = str(p.pop("_id"))
        result.append(p)
    return {"products": result, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product["id"] = str(product.pop("_id"))
    return product

@api_router.get("/categories")
async def get_categories():
    categories = await db.products.distinct("category")
    return {"categories": categories}


# ── Payment & Order Endpoints ─────────────────────────────────────────────

@api_router.post("/payment/create-order")
async def create_payment_order(data: PaymentOrderCreate, current_user: dict = Depends(get_current_user)):
    if not rzp_client:
        return {"id": f"order_demo_{uuid.uuid4().hex[:12]}", "amount": data.amount, "currency": data.currency, "demo": True}
    receipt = (data.receipt or f"rec_{uuid.uuid4().hex[:10]}")[:40]
    order = rzp_client.order.create({"amount": data.amount, "currency": data.currency, "payment_capture": 1, "receipt": receipt})
    return order

@api_router.post("/orders")
async def create_order(data: OrderCreate, current_user: dict = Depends(get_current_user)):
    if not data.razorpay_order_id.startswith("order_demo_"):
        if rzp_client and RAZORPAY_KEY_SECRET:
            msg = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"
            generated = hmac.new(RAZORPAY_KEY_SECRET.encode('utf-8'), msg.encode('utf-8'), hashlib.sha256).hexdigest()
            if generated != data.razorpay_signature:
                raise HTTPException(status_code=400, detail="Payment verification failed")

    order_doc = {
        "user_id": current_user["id"], "user_name": current_user["name"],
        "user_email": current_user["email"],
        "items": [item.model_dump() for item in data.items],
        "total_amount": data.total_amount,
        "shipping_address": data.shipping_address.model_dump(),
        "status": "paid",
        "razorpay_order_id": data.razorpay_order_id,
        "razorpay_payment_id": data.razorpay_payment_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.orders.insert_one(order_doc)
    order_doc["id"] = str(result.inserted_id)
    order_doc.pop("_id", None)
    return order_doc

@api_router.get("/orders/me")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user["id"]}).sort([("created_at", -1)]).to_list(100)
    for o in orders:
        o["id"] = str(o.pop("_id"))
    return {"orders": orders}

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Order not found")
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["user_id"] != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    order["id"] = str(order.pop("_id"))
    return order


# ── Admin Endpoints ───────────────────────────────────────────────────────

@api_router.get("/admin/stats")
async def admin_stats(admin: dict = Depends(get_admin_user)):
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_users = await db.users.count_documents({})
    revenue_result = await db.orders.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    recent_orders = await db.orders.find({}).sort([("created_at", -1)]).limit(5).to_list(5)
    for o in recent_orders:
        o["id"] = str(o.pop("_id"))
    return {"total_products": total_products, "total_orders": total_orders, "total_users": total_users, "total_revenue": total_revenue, "recent_orders": recent_orders}

@api_router.get("/admin/products")
async def admin_get_products(admin: dict = Depends(get_admin_user), page: int = 1, limit: int = 20):
    skip = (page - 1) * limit
    total = await db.products.count_documents({})
    products = await db.products.find({}).skip(skip).limit(limit).to_list(limit)
    for p in products:
        p["id"] = str(p.pop("_id"))
    return {"products": products, "total": total}

@api_router.post("/admin/products")
async def admin_create_product(data: ProductCreate, admin: dict = Depends(get_admin_user)):
    doc = {**data.model_dump(), "rating": 4.0, "reviews_count": 0, "created_at": datetime.now(timezone.utc).isoformat()}
    result = await db.products.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/products/{product_id}")
async def admin_update_product(product_id: str, data: ProductUpdate, admin: dict = Depends(get_admin_user)):
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    try:
        await db.products.update_one({"_id": ObjectId(product_id)}, {"$set": updates})
        product = await db.products.find_one({"_id": ObjectId(product_id)})
        product["id"] = str(product.pop("_id"))
        return product
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")

@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, admin: dict = Depends(get_admin_user)):
    try:
        result = await db.products.delete_one({"_id": ObjectId(product_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")

@api_router.get("/admin/orders")
async def admin_get_orders(admin: dict = Depends(get_admin_user), page: int = 1, limit: int = 20):
    skip = (page - 1) * limit
    total = await db.orders.count_documents({})
    orders = await db.orders.find({}).sort([("created_at", -1)]).skip(skip).limit(limit).to_list(limit)
    for o in orders:
        o["id"] = str(o.pop("_id"))
    return {"orders": orders, "total": total}

@api_router.put("/admin/orders/{order_id}/status")
async def admin_update_order_status(order_id: str, data: OrderStatusUpdate, admin: dict = Depends(get_admin_user)):
    valid = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]
    if data.status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status")
    try:
        await db.orders.update_one({"_id": ObjectId(order_id)}, {"$set": {"status": data.status}})
        return {"message": "Order status updated"}
    except Exception:
        raise HTTPException(status_code=404, detail="Order not found")

@api_router.get("/admin/users")
async def admin_get_users(admin: dict = Depends(get_admin_user), page: int = 1, limit: int = 20):
    skip = (page - 1) * limit
    total = await db.users.count_documents({})
    users = await db.users.find({}, {"password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    for u in users:
        u["id"] = str(u.pop("_id"))
    return {"users": users, "total": total}


# ── Seed Data ─────────────────────────────────────────────────────────────

SEED_PRODUCTS = [
    {"name": "Arduino Uno R3", "description": "Classic development board based on ATmega328P. Perfect for beginners and experts alike with 14 digital I/O pins.", "price": 599, "category": "Microcontrollers", "stock": 150, "image_url": "https://images.unsplash.com/photo-1603732551681-2e91159b9dc2?w=500&q=80", "brand": "Arduino", "rating": 4.8, "reviews_count": 1240, "featured": True},
    {"name": "Raspberry Pi 4 Model B (4GB)", "description": "Powerful single-board computer with 4GB RAM, dual 4K display support, USB 3.0, and Gigabit Ethernet.", "price": 6499, "category": "Microcontrollers", "stock": 45, "image_url": "https://images.unsplash.com/photo-1553406830-1c853b38df08?w=500&q=80", "brand": "Raspberry Pi", "rating": 4.9, "reviews_count": 876, "featured": True},
    {"name": "Arduino Nano", "description": "Compact Arduino board based on ATmega328P, breadboard-friendly design perfect for small embedded projects.", "price": 299, "category": "Microcontrollers", "stock": 200, "image_url": "https://images.unsplash.com/photo-1603732551681-2e91159b9dc2?w=500&q=80", "brand": "Arduino", "rating": 4.7, "reviews_count": 645, "featured": False},
    {"name": "Arduino Mega 2560", "description": "Feature-rich board with 54 digital I/O, 16 analog inputs, 256KB flash. Ideal for complex projects.", "price": 1299, "category": "Microcontrollers", "stock": 80, "image_url": "https://images.unsplash.com/photo-1603732551681-2e91159b9dc2?w=500&q=80", "brand": "Arduino", "rating": 4.6, "reviews_count": 432, "featured": False},
    {"name": "HC-SR04 Ultrasonic Sensor", "description": "Precision distance measurement module with 2cm to 400cm range. Essential for robotics and automation.", "price": 129, "category": "Sensors & Modules", "stock": 300, "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80", "brand": "Generic", "rating": 4.5, "reviews_count": 892, "featured": False},
    {"name": "DHT11 Temperature & Humidity Sensor", "description": "Digital sensor for temperature (-20 to 60°C) and humidity measurement with 3-5V operating voltage.", "price": 99, "category": "Sensors & Modules", "stock": 500, "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80", "brand": "Generic", "rating": 4.4, "reviews_count": 1120, "featured": True},
    {"name": "MPU6050 Gyroscope Accelerometer", "description": "6-axis motion tracking module with I2C interface. Perfect for drones, balancing robots, and gesture control.", "price": 249, "category": "Sensors & Modules", "stock": 200, "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80", "brand": "InvenSense", "rating": 4.7, "reviews_count": 567, "featured": False},
    {"name": "MQ-2 Gas Sensor Module", "description": "Detects LPG, smoke, alcohol, propane, hydrogen, methane gases. Ideal for safety and alarm systems.", "price": 179, "category": "Sensors & Modules", "stock": 180, "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80", "brand": "Generic", "rating": 4.3, "reviews_count": 334, "featured": False},
    {"name": "DC Gear Motor 60 RPM", "description": "High-torque DC gear motor with metal gearbox. 12V operation, ideal for robot chassis and conveyor systems.", "price": 199, "category": "Robotics & Motors", "stock": 250, "image_url": "https://images.pexels.com/photos/8438863/pexels-photo-8438863.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Cytron", "rating": 4.5, "reviews_count": 445, "featured": False},
    {"name": "Servo Motor SG90 9g", "description": "Micro servo motor with 180-degree rotation, high precision. Tower Pro SG90 for RC cars and robotics arms.", "price": 149, "category": "Robotics & Motors", "stock": 400, "image_url": "https://images.pexels.com/photos/8438863/pexels-photo-8438863.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Tower Pro", "rating": 4.6, "reviews_count": 876, "featured": True},
    {"name": "NEMA17 Stepper Motor", "description": "Bipolar stepper motor for 3D printers and CNC machines. 1.8-degree step angle, 40Ncm holding torque.", "price": 699, "category": "Robotics & Motors", "stock": 120, "image_url": "https://images.pexels.com/photos/8438863/pexels-photo-8438863.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Generic", "rating": 4.7, "reviews_count": 234, "featured": False},
    {"name": "L298N Motor Driver Module", "description": "Dual H-Bridge motor driver board. Controls 2 DC motors or 1 stepper motor up to 2A continuous current.", "price": 249, "category": "Robotics & Motors", "stock": 300, "image_url": "https://images.pexels.com/photos/8438863/pexels-photo-8438863.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Generic", "rating": 4.5, "reviews_count": 678, "featured": False},
    {"name": "ESP32 Development Board", "description": "Dual-core 240MHz processor with built-in WiFi 802.11 and Bluetooth 4.2. The ultimate IoT development board.", "price": 499, "category": "Development Boards", "stock": 300, "image_url": "https://images.pexels.com/photos/10635975/pexels-photo-10635975.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Espressif", "rating": 4.9, "reviews_count": 2140, "featured": True},
    {"name": "NodeMCU ESP8266", "description": "Low-cost WiFi microcontroller with full TCP/IP stack. Easy Arduino IDE programming for IoT projects.", "price": 299, "category": "Development Boards", "stock": 400, "image_url": "https://images.pexels.com/photos/10635975/pexels-photo-10635975.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Espressif", "rating": 4.7, "reviews_count": 1560, "featured": True},
    {"name": "STM32 Blue Pill F103", "description": "ARM Cortex-M3 board at 72MHz with 64KB Flash, 20KB SRAM. Great performance-to-price ratio.", "price": 399, "category": "Development Boards", "stock": 150, "image_url": "https://images.pexels.com/photos/10635975/pexels-photo-10635975.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "STMicro", "rating": 4.5, "reviews_count": 345, "featured": False},
    {"name": "BBC micro:bit V2", "description": "Educational microcontroller with built-in sensors, LED matrix, radio, and wireless capabilities for learning.", "price": 2499, "category": "Development Boards", "stock": 80, "image_url": "https://images.pexels.com/photos/10635975/pexels-photo-10635975.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "micro:bit", "rating": 4.8, "reviews_count": 234, "featured": False},
    {"name": "Jumper Wires M-M 40pcs", "description": "Premium male-to-male dupont wires for breadboard prototyping. 20cm length, multi-color coding, 40 pieces.", "price": 99, "category": "Electronic Components", "stock": 1000, "image_url": "https://images.pexels.com/photos/159201/circuit-circuit-board-resistor-computer-159201.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Generic", "rating": 4.4, "reviews_count": 2340, "featured": False},
    {"name": "Resistors Kit 600pcs", "description": "Complete assortment of 30 different resistor values from 10Ω to 1MΩ. Includes storage box.", "price": 249, "category": "Electronic Components", "stock": 500, "image_url": "https://images.pexels.com/photos/159201/circuit-circuit-board-resistor-computer-159201.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Generic", "rating": 4.6, "reviews_count": 876, "featured": False},
    {"name": "Breadboard 830 Points", "description": "High-quality solderless breadboard with 830 tie points for circuit prototyping and testing.", "price": 179, "category": "Electronic Components", "stock": 600, "image_url": "https://images.pexels.com/photos/159201/circuit-circuit-board-resistor-computer-159201.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Generic", "rating": 4.7, "reviews_count": 1234, "featured": True},
    {"name": "LED Assorted Kit 100pcs", "description": "100 LEDs in 5 colors: red, green, blue, yellow, white. 5mm size, 20pcs each color.", "price": 149, "category": "Electronic Components", "stock": 800, "image_url": "https://images.pexels.com/photos/159201/circuit-circuit-board-resistor-computer-159201.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Generic", "rating": 4.5, "reviews_count": 567, "featured": False},
    {"name": "PLA Filament 1kg White", "description": "Premium PLA filament 1.75mm, 1kg spool. Easy to print with minimal warping. Dimensional accuracy ±0.02mm.", "price": 1299, "category": "3D Printing", "stock": 100, "image_url": "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Buildoreo Supplies", "rating": 4.7, "reviews_count": 432, "featured": False},
    {"name": "ABS Filament 1kg Black", "description": "High-strength ABS filament 1.75mm, 1kg. Perfect for functional parts requiring durability and impact resistance.", "price": 1499, "category": "3D Printing", "stock": 80, "image_url": "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Buildoreo Supplies", "rating": 4.5, "reviews_count": 234, "featured": False},
    {"name": "3D Printer Nozzle Kit 0.4mm", "description": "MK8 brass nozzles pack of 10 pieces. Universal fit for Ender 3, CR-10, and most FDM printers.", "price": 499, "category": "3D Printing", "stock": 200, "image_url": "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Generic", "rating": 4.4, "reviews_count": 156, "featured": True},
    {"name": "PETG Filament 1kg Blue", "description": "Clear blue PETG filament 1.75mm. Combines ease of PLA with durability of ABS. Perfect for mechanical parts.", "price": 1699, "category": "3D Printing", "stock": 60, "image_url": "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=500", "brand": "Buildoreo Supplies", "rating": 4.8, "reviews_count": 89, "featured": False},
    {"name": "HC-05 Bluetooth Module", "description": "Classic Bluetooth 2.0 SPP module for wireless serial communication. Easy AT command configuration.", "price": 249, "category": "IoT & Wireless Modules", "stock": 350, "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80", "brand": "Generic", "rating": 4.5, "reviews_count": 876, "featured": False},
    {"name": "NRF24L01 RF Module", "description": "2.4GHz wireless transceiver with SPI interface. Up to 100m range outdoors, 2Mbps data rate.", "price": 199, "category": "IoT & Wireless Modules", "stock": 250, "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80", "brand": "Nordic Semi", "rating": 4.4, "reviews_count": 456, "featured": True},
    {"name": "SIM800L GSM Module", "description": "Quad-band GSM/GPRS module. Send SMS, make calls, and access mobile data with your microcontroller.", "price": 699, "category": "IoT & Wireless Modules", "stock": 80, "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80", "brand": "SIMCom", "rating": 4.3, "reviews_count": 234, "featured": False},
    {"name": "LoRa Module SX1278", "description": "Long-range 433MHz LoRa transceiver. Up to 10km line-of-sight range. Ideal for smart city IoT projects.", "price": 899, "category": "IoT & Wireless Modules", "stock": 60, "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80", "brand": "Semtech", "rating": 4.7, "reviews_count": 123, "featured": False},
]

async def seed_database():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@buildoreo.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        await db.users.insert_one({
            "name": "Admin", "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin created: {admin_email}")
    elif not verify_password(admin_password, existing_admin["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    product_count = await db.products.count_documents({})
    if product_count == 0:
        for p in SEED_PRODUCTS:
            p["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.products.insert_many(SEED_PRODUCTS)
        logger.info(f"Seeded {len(SEED_PRODUCTS)} products")

    await db.users.create_index("email", unique=True)
    await db.products.create_index("category")
    logger.info("Startup complete")


# ── App Setup ─────────────────────────────────────────────────────────────

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await seed_database()

@app.on_event("shutdown")
async def shutdown():
    client.close()
