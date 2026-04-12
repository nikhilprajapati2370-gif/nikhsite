# Buildoreo E-Commerce Platform - PRD

## Problem Statement
Full-stack e-commerce website for electronics components called "Buildoreo". Features landing page, product browsing (Amazon-like), login/signup, Razorpay payment, admin panel. Techy dark theme.

## Architecture
- **Frontend**: React SPA, Framer-motion animations, Tailwind CSS dark techy theme (#FACC15 yellow, #00FF66 green)
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB (test_database)
- **Auth**: JWT tokens stored in localStorage, Bearer header

## Tech Stack
- Frontend: React 19, React Router 7, Framer-motion, Lucide icons, Tailwind CSS, JetBrains Mono + Outfit fonts
- Backend: FastAPI, Motor, bcrypt, PyJWT, razorpay, pymongo

## What's Implemented (2024-01-01)

### Landing Page
- Full-screen animated hero section (circuit background + floating particles + hero image)
- 7 Category cards with images and hover effects
- Featured products grid (8 products)
- Promotional banner
- Stats section, Features bar, Why Buildoreo section
- Footer with links

### Product Catalog
- 28 seed products across 7 categories
- Product browsing page with sidebar category filter + sort (price, rating)
- Search functionality (name, description, brand)
- Product detail page with related products
- Pagination support

### Shopping Cart
- Persistent cart via localStorage
- Quantity controls, remove item, clear cart
- Free shipping threshold (₹999)
- Order summary with grand total

### Authentication
- User registration + login (JWT)
- Admin login → redirects to /admin
- Protected routes (checkout, order success)
- Admin routes (admin-only access)

### Checkout & Payment
- Razorpay integration (full flow)
- Demo mode when no real Razorpay keys (simulated payment)
- Shipping address form with validation
- Order creation after payment verification

### Admin Dashboard
- Overview: Stats cards (products, orders, revenue, users), recent orders
- Products: CRUD table with add/edit/delete modal, pagination
- Orders: Table with status update dropdown (pending/paid/processing/shipped/delivered/cancelled)
- Users: User list with roles

## Categories (7)
1. Microcontrollers (Arduino Uno, Raspberry Pi, Nano, Mega)
2. Sensors & Modules (HC-SR04, DHT11, MPU6050, MQ-2)
3. Robotics & Motors (DC Gear, SG90 Servo, NEMA17, L298N)
4. Development Boards (ESP32, NodeMCU, STM32, BBC micro:bit)
5. Electronic Components (Jumper wires, Resistors, Breadboard, LEDs)
6. 3D Printing (PLA, ABS, PETG filaments, nozzles)
7. IoT & Wireless Modules (HC-05, NRF24L01, SIM800L, LoRa SX1278)

## API Endpoints
- POST /api/auth/register, /api/auth/login, GET /api/auth/me
- GET /api/products, GET /api/products/:id, GET /api/categories
- POST /api/payment/create-order, POST /api/orders
- GET /api/orders/me, GET /api/orders/:id
- GET /api/admin/stats, /api/admin/products, /api/admin/orders, /api/admin/users
- POST /api/admin/products, PUT /api/admin/products/:id, DELETE /api/admin/products/:id
- PUT /api/admin/orders/:id/status

## Test Credentials
- Admin: admin@buildoreo.com / admin123
- Test user: uitest_fresh@buildoreo.com / testpass123

## Backlog / P1 Features
- [ ] Add real Razorpay test/live keys (user to provide from Razorpay dashboard)
- [ ] Product reviews and ratings system
- [ ] User order history page (/orders)
- [ ] Wishlist/Favorites
- [ ] Product image gallery (multiple images)
- [ ] Coupon/discount codes
- [ ] Email notifications (order confirmation)
- [ ] Advanced admin analytics (charts)
- [ ] Address book for saved addresses

## Environment Variables
### Backend (.env)
- MONGO_URL, DB_NAME, CORS_ORIGINS
- JWT_SECRET
- ADMIN_EMAIL, ADMIN_PASSWORD
- RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (replace placeholder_ values with real keys)

### Frontend (.env)
- REACT_APP_BACKEND_URL
- REACT_APP_RAZORPAY_KEY (add your Razorpay key ID here)
