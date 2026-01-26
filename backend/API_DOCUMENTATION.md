# 📖 POSBuzz API Documentation

Base URL: `http://localhost:3000/api/v1`

---

## 🔑 Authentication

### Register
`POST /auth/register`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response (201)**:
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "access_token": "jwt-token"
}
```

### Login
`POST /auth/login`
- **Body**: Same as Register.

---

## 📦 Products

### List Products
`GET /products?page=1&limit=10&search=Laptop`
- **Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Laptop",
      "sku": "LAP001",
      "price": 999.99,
      "stock_quantity": 45
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

### Create Product (Protected)
`POST /products`
- **Body**:
```json
{
  "name": "Mouse",
  "sku": "MOU-001",
  "price": 25.00,
  "stock_quantity": 100
}
```

### Update Product
`PUT /products/:id`

---

## 💰 Sales

### Create Sale (POS Checkout)
`POST /sales`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "items": [
    { "productId": "uuid-1", "quantity": 2 },
    { "productId": "uuid-2", "quantity": 1 }
  ]
}
```
- **Response (201)**:
```json
{
  "id": "sale-uuid",
  "total_amount": 2024.98,
  "items": [...]
}
```

### Sale History
`GET /sales?page=1&limit=10`

### Sale Details
`GET /sales/:id`

---

## 🏥 System

### Health Check
`GET /health`
- **Response (200)**:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```
