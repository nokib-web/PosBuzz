# 🐝 POSBuzz - Next-Generation Layout POS System

POSBuzz is a modern, high-performance Point of Sale (POS) and Inventory Management System designed for scalability and efficiency. Built with an industry-leading tech stack, it provides businesses with real-time analytics, seamless transaction processing, and robust inventory control.

## 🚀 Live Demo

Experience the full application live:

- **Frontend Application**: [https://pos-buzz-frontend-beta.vercel.app/login](https://pos-buzz-frontend-beta.vercel.app/login)
  - *Demo Admin Credentials provided on the login page.*
- **Backend API**: [https://posbuzzbackend.up.railway.app/api/v1](https://posbuzzbackend.up.railway.app/api/v1)
- **API Documentation (Swagger)**: [https://posbuzzbackend.up.railway.app/api-docs](https://posbuzzbackend.up.railway.app/api-docs)

---

## ✨ Key Features

### 🖥️ Modern Point of Sale (POS)
- **Fast Checkout**: Efficient cart management with instant calculations for tax and totals.
- **Smart Search**: Find products instantly via name, SKU, or barcode scanning.
- **Barcode Integration**: Integrated `html5-qrcode` scanner for physical inventory interactions.
- **Customer Association**: Link sales to existing customers to track purchase history and loyalty.

### 📦 Inventory & Product Management
- **Real-time Tracking**: Live stock updates preventing overselling.
- **Low Stock Alerts**: Visual indicators and dashboard warnings for items needing restocking.
- **Supplier Management**: comprehensive vendor directory linked to product sourcing.
- **Quick Restock**: One-click restocking modal for rapid inventory updates.

### 📊 Analytics & Reporting
- **Interactive Dashboard**: Visualized sales trends using **Recharts**.
- **Sales Insights**: Detail reports on top-selling products and revenue trends.
- **Performance Metrics**: Daily, weekly, and monthly sales summaries.

### 🛡️ Security & Access Control
- **Role-Based Access Control (RBAC)**: Distinct permissions for **Admins** (Inventory/Settings) and **Cashiers** (Sales only).
- **Secure Authentication**: Industry-standard **JWT** (JSON Web Token) authentication with **Bcrypt** password hashing.
- **Auto-Logout**: Security interceptors to handle session expiry automatically.

### 🎨 Premium UI/UX
- **Responsive Design**: Fully optimized for desktop and tablet usage.
- **Glassmorphism Aesthetic**: Modern login interface with premium split-screen design.
- **Ant Design System**: Enterprise-grade component library for a consistent and accessible user experience.

---

## 🛠 Tech Stack

### Frontend (Client-Side)
- **Framework**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) (Lightning fast HMR)
- **UI Library**: [Ant Design](https://ant.design/) 5.x
- **State Management**: [TanStack Query](https://tanstack.com/query) (Server State)
- **Visualization**: [Recharts](https://recharts.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend (Server-Side)
- **Framework**: [NestJS](https://nestjs.com/) (Enterprise Node.js framework)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **API Docs**: [Swagger / OpenAPI](https://swagger.io/)
- **Validation**: `class-validator` & `class-transformer`

### Infrastructure & DevOps
- **Backend Hosting**: [Railway](https://railway.app/)
- **Frontend Hosting**: [Vercel](https://vercel.com/)
- **CI/CD**: Git-based automated deployments

---

## 📂 Project Structure

```text
posbuzz/
├── backend/            # NestJS Application
│   ├── src/
│   │   ├── modules/    # Feature-based modules (Auth, User, Product, Sale, etc.)
│   │   ├── prisma/     # Database Service
│   │   └── common/     # Guards, Decorators, Filters
│   └── prisma/         # Schema and Migration files
│
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── pages/      # Route Pages (Dashboard, POS, Login)
│   │   ├── services/   # API Integration
│   │   └── hooks/      # Custom React Hooks
│   └── public/         # Static Assets
└── DEPLOYMENT.md       # Production deployment guide
```

---

## 💻 Local Development Setup

To run POSBuzz on your local machine:

### 1. Prerequisite
- Node.js (v18 or higher)
- PostgreSQL Database

### 2. Installation
```powershell
# Clone the repository
git clone https://github.com/nokib-web/PosBuzz.git
cd posbuzz

# Install dependencies (Monorepo root)
npm install
```

### 3. Environment Setup
Create `.env` files in both `backend` and `frontend` directories based on the `.env.example` files provided.

### 4. Database Initialization
```powershell
cd backend
npx prisma generate
npx prisma db push
npx ts-node setup-demo.ts # Creates initial Admin/Employee accounts
```

### 5. Start the Application
```powershell
# From the root directory
npm run dev
```
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000/api/v1

---

## 📄 License
MIT License - Copyright (c) 2026 POSBuzz Team.
