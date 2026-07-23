# 🛒 POSBuzz Pro - Enterprise Omnichannel POS & Superstore Retail Platform

![POSBuzz Platform Banner](frontend/public/login-bg.png)

**POSBuzz** is a state-of-the-art, high-performance Omnichannel Point of Sale (POS) and Superstore Inventory Management System engineered specifically for modern retail chain outlets, superstores (like Shwapno, Meena Bazar, Unimart), and e-commerce enterprises in Bangladesh.

---

## 🌟 Key Features & Highlights

- **🇧🇩 Fixed BDT (`Tk 0.00`) Currency Engine**: Built-in Bangladesh Taka currency formatting across all dashboards, checkout billing counters, invoices, and thermal memo prints.
- **⚡ High-Speed Counter POS Checkout Terminal**: Touch-optimized catalogue grid with category tabs, supplier filters, coupon offers, custom discounts (% or Tk), and instant change return calculation.
- **⌨️ Complete POS Keyboard Shortcuts (F1 - F10)**: Fast counter operation without mouse dependency using standardized function keys.
- **🏷️ High-DPI Vector CODE128 Barcode Sticker Printing**: Generate and print vector CODE128 barcode stickers in two modes:
  - **A4 Sheet Grid (24 Labels per page)** for desktop printers.
  - **Thermal Label (50mm x 30mm)** for Xprinter, Zebra, and TSC barcode label printers.
- **⚖️ Loose Weight & Variable Fraction Billing**: Sell loose groceries (Rice, Sugar, Oil) by exact decimal weight (e.g. `1.5 Kg`, `0.5 Kg`, `3.10 Kg`) with real-time per-Kg pricing.
- **🌐 Real-Time Omnichannel Inventory Sync**: Synchronize stock levels across physical retail outlets, warehouse hubs, and online e-commerce platforms.
- **💵 Cash Till Shift & Float Reconciliation**: Opening float, cash drawer tracking, end-of-shift reconciliation with automated surplus/shortage discrepancy reporting.
- **🛡️ Enterprise Role-Based Access Control (RBAC)**: Distinct permissions for **Admin Executive**, **Store Manager**, and **Front-Desk Cashier**.

---

## 👥 User Roles & Operational Workflows

### 👑 1. Admin Executive (`ADMIN`)
- **Access Scope**: Full enterprise visibility across all store branches and outlets.
- **Core Operations**:
  - Manage Staff & User Access Accounts (Create, edit, lock cashier/manager logins).
  - Manage Store Outlets & Multi-Branch Expansion (`/outlets`).
  - View Enterprise Analytics Dashboard, Revenue Trends, and Profit Metrics.
  - Oversee Supplier Registry, Master Inventory Catalog, and Customer Databases.

### 🏢 2. Store Manager (`MANAGER`)
- **Access Scope**: Assigned store branch operations and staff supervision.
- **Core Operations**:
  - Perform Inventory Restocking & Stock Adjustments.
  - Create and Manage Active Promotions & Coupon Offers.
  - Reconcile Till Shifts & Cash Registers.
  - Process Customer Refunds and Transaction Adjustments.

### 💳 3. Front-Desk Cashier (`CASHIER`)
- **Access Scope**: Dedicated POS Terminal Checkout Counter.
- **Core Operations**:
  - Process Real-Time Sales & Print Thermal/PDF Receipts.
  - Hardware USB/Bluetooth Barcode Scanner & Camera Scanning.
  - Customer Accounts Lookup & Loyalty Points Balance.
  - Product & Stock Lookup (`/products`).

---

## ⌨️ POS Counter Keyboard Shortcuts Guide

Cashiers can process checkout transactions rapidly using physical function keys:

| Shortcut Key | Visual Badge | Description / Action |
| :--- | :---: | :--- |
| **`F1`** | `F1` | **Focus Product Search Box** (Instant cursor focus) |
| **`F2`** | `F2` | **Clear / Reset Active Order Cart** |
| **`F3`** | `F3` | **Focus Customer Account Selection** |
| **`F4`** | `F4` | **Select Payment Method to CASH** |
| **`F5`** | `F5` | **Select Payment Method to CARD** |
| **`F6`** | `F6` | **Select Payment Method to MOBILE / OTHER** |
| **`F8`** | `F8` | **Quick Cash Preset (Tender Tk 1000)** |
| **`F9`** | `F9` | **Process Payment & Print Receipt** |
| **`F10`** | `F10` | **Toggle Camera Barcode Scanner** |
| **`ESC`** | `ESC` | **Reset Order Cart / Close Open Modals** |
| **`Barcode Scanner`** | `USB/BT` | **Auto-Add Item to Cart on Scan** |

---

## 🛠️ Technology Stack

### 🎨 Frontend:
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Ant Design 5 (Curated Dark/Light Theme with `#d6d750` Lime Accent)
- **State & Data Fetching**: TanStack React Query v5 (Configured with 10-min High-Speed RAM Cache)
- **Charts & Visualization**: Recharts
- **PDF & Receipt Generation**: jsPDF + autoTable

### ⚙️ Backend & Infrastructure:
- **Framework**: NestJS + TypeScript
- **Database & ORM**: PostgreSQL (Hosted on Neon Cloud) + Prisma ORM
- **Cache & Session**: Redis (Hosted on Upstash)
- **Authentication**: JWT + Passport + Bcrypt Password Hashing

---

## 🚀 Setup & Local Installation

### Prerequisites
- Node.js `v18+`
- npm `v9+`

### 1. Repository Clone
```bash
git clone https://github.com/nokib-web/PosBuzz.git
cd PosBuzz
```

### 2. Backend Setup
```bash
cd backend
npm install

# Environment Variables Configuration
# Copy .env.example to .env and configure DATABASE_URL

# Apply Database Schema & Seed Data
npx prisma db push
npx prisma db seed

# Run Backend Dev Server
npm run start:dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Run Frontend Dev Server
npm run dev
```

The application will be accessible locally at `http://localhost:5173`.

---

## 🔑 Demo Account Credentials

| Role | Username / Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin Executive** | `admin` / `admin@posbuzz.com` | `admin123` | Full System & Staff Access |
| **Store Manager** | `rahim_ctg` / `manager@posbuzz.com` | `manager123` | Outlet Operations & Stock |
| **Front-Desk Cashier**| `karim_desk` / `employee@gmail.com` | `cashier123` | POS Terminal Checkout |

---

## 📄 License & Credits

Developed with ❤️ by **Deepmind Team / Nokib Web**. Designed for enterprise scalability and high-speed retail operations.
