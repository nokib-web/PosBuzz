# 🐝 POSBuzz - Comprehensive POS & Inventory Management System

POSBuzz is a professional, full-stack Point of Sale (POS) system designed for small to medium enterprises. It allows businesses to manage products, track inventory in real-time, and process sales with high data integrity.

## 🚀 Live Demo
- **Frontend**: [posbuzz-ui.vercel.app](https://posbuzz-ui.vercel.app)
- **Backend API**: [posbuzz-api.railway.app](https://posbuzz-api.railway.app/api/v1)

---

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for high-performance reading
- **Security**: JWT Authentication + Bcrypt hashing
- **Testing**: Jest

### Frontend
- **Library**: React 18 + TypeScript
- **Tooling**: Vite
- **UI Framework**: Ant Design (Premium Design System)
- **State Management**: TanStack Query (React Query)
- **API Client**: Axios with interceptors

---

## ✨ Key Features
- **Authentication**: Secure JWT-based registration and login system with persistent sessions.
- **Product Management**: Complete CRUD with SKU tracking and real-time stock alerts.
- **POS Terminal**: Dynamic sales interface with cart management and automated stock validation.
- **Interactive Dashboard**: Real-time business metrics, low stock warnings, and transaction history.
- **Transaction Safety**: Atomic database transactions ensure inventory accuracy during sales.
- **Caching**: Integrated Redis caching for lightning-fast product listings.

---

## 📂 Project Structure
```text
posbuzz/
├── backend/            # NestJS API, Prisma Schema, Core Logic
├── frontend/           # React + Vite application, Ant Design UI
├── .agent/             # Agent configuration and workflows
├── DEPLOYMENT.md       # Step-by-step production guide
└── POSBuzz.postman_collection.json  # Pre-configured API tests
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis

### 1. Installation
```powershell
# Clone the repository
git clone https://github.com/nokib-web/PosBuzz.git
cd posbuzz

# Install all dependencies (Monorepo root)
npm install
```

### 2. Environment Configuration
Create a `.env` file in both `backend/` and `frontend/` folders.

**Backend (.env):**
```text
DATABASE_URL="postgresql://user:pass@localhost:5432/posbuzz"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret"
PORT=3000
```

**Frontend (.env):**
```text
VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Database Sync
```powershell
cd backend
npx prisma db push
```

### 4. Run the Apps
```powershell
# From root
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/api/v1`
- Swagger Docs: `http://localhost:3000/api-docs`

---

## 🧪 Testing & Documentation
- **API Tests**: Import `POSBuzz.postman_collection.json` into Postman.
- **Manual**: Use the Swagger documentation at `/api-docs` for interactive API testing.

---

## 📄 License
MIT License - Copyright (c) 2026 POSBuzz Team.
