# 🛒 POSBuzz Pro - Enterprise Omnichannel POS & Superstore Retail Platform

![POSBuzz Platform Banner](frontend/public/login-bg.png)

**POSBuzz Pro** is an end-to-end, enterprise-grade Omnichannel Point of Sale (POS), Multi-Store Outlet Manager, and Inventory ERP Platform. Designed specifically for retail chains, superstores (such as Shwapno, Meena Bazar, Unimart, Apex, Aarong), and modern commerce businesses, POSBuzz provides lightning-fast counter billing, real-time inventory synchronization, vector barcode label printing, and granular multi-branch management.

---

## 📑 Table of Contents
1. [Architectural Overview](#-architectural-overview)
2. [Multi-Store & Outlet Branch Management](#-multi-store--outlet-branch-management)
3. [User Management & Role-Based Access Control (RBAC)](#-user-management--role-based-access-control-rbac)
4. [Modern POS Counter Billing & Checkout Flow](#-modern-pos-counter-billing--checkout-flow)
5. [Loose Weight & Variable Fraction Billing](#-loose-weight--variable-fraction-billing)
6. [Vector CODE128 Barcode Sticker Printing Engine](#-vector-code128-barcode-sticker-printing-engine)
7. [Cash Till Shift & Reconciliation Engine](#-cash-till-shift--reconciliation-engine)
8. [Complete POS Keyboard Shortcuts Guide](#-pos-counter-keyboard-shortcuts-guide)
9. [High-Performance Caching & Performance Architecture](#-high-performance-caching--performance-architecture)
10. [Technology Stack & System Requirements](#-technology-stack--system-requirements)
11. [Local Development & Cloud Deployment Guide](#-local-development--cloud-deployment-guide)

---

## 🏛️ Architectural Overview

POSBuzz is engineered using a decoupled modern micro-frontend and REST API architecture.

```mermaid
graph TD
    A["React 18 + TS Client (Vite)"] -->|"Axios (3s Timeout)"| B["NestJS Backend API"]
    A -->|"TanStack Query (10-min Cache)"| C["RAM State Memory"]
    B -->|"Prisma ORM"| D["Neon Cloud PostgreSQL DB"]
    B -->|"Redis Cache"| E["Upstash Cloud Redis"]
    A -->|"PDF / Memo Generator"| F["jsPDF & Thermal Printer"]
    A -->|"Vector Barcode Engine"| G["SVG CODE128 Label Printer"]
```

---

## 🏬 Multi-Store & Outlet Branch Management

POSBuzz natively supports multi-branch enterprise retail chains with centralized administration and localized outlet operations.

### 📍 Key Capabilities:
- **Global Enterprise Mode (`All Outlets Combined`)**: Admin executives can view combined revenue, profit metrics, and consolidated sales history across all store branches in real time.
- **Outlet Isolation & Branch Context**: Managers and Cashiers are contextually scoped to their assigned outlet (e.g., `Dhaka Main Store`, `Uttara Branch`, `Chittagong Hub`).
- **Dynamic Branch Switcher**: Authorised Admin and Manager accounts can switch active store branch views seamlessly from the top navigation bar.
- **Store Outlets Workspace (`/outlets`)**: Full page outlet manager to add new store branches, assign managers, update physical store addresses, and view per-branch sales performance.

```
+-----------------------------------------------------------------------+
|                         ENTERPRISE HEADQUARTERS                       |
|                             (Admin Executive)                         |
+-----------------------------------+-----------------------------------+
                                    |
        +---------------------------+---------------------------+
        |                                                       |
        v                                                       v
+-------------------------------+               +-------------------------------+
|     DHAKA MAIN STORE OUTLET   |               |     CHITTAGONG HUB OUTLET     |
|   (Manager + Front Cashier)   |               |   (Manager + Front Cashier)   |
+-------------------------------+               +-------------------------------+
```

---

## 👥 User Management & Role-Based Access Control (RBAC)

POSBuzz enforces strict Role-Based Access Control (RBAC) to ensure operational security at retail counter desks.

### 🔐 Permission Matrix:

| Feature / Workspace Module | Admin Executive (`ADMIN`) | Store Manager (`MANAGER`) | Front-Desk Cashier (`CASHIER`) |
| :--- | :---: | :---: | :---: |
| **Enterprise Analytics Dashboard** | ✅ Full Access | 🔒 Scoped to Outlet | ❌ Restricted |
| **POS Terminal Checkout (`/sales/new`)** | 👤 Management View | ✅ Allowed | ✅ Full Counter Access |
| **Item & Stock Lookup (`/products`)** | ✅ Full CRUD | ✅ View & Restock | 👁️ View & Search Only |
| **Transactions & Refund History** | ✅ All Branches | ✅ Outlet History | ✅ Counter Returns |
| **Staff User Management (`/users`)** | ✅ Full CRUD | ❌ Restricted | ❌ Restricted |
| **Customer Accounts (`/customers`)** | ✅ Full CRUD | ✅ Full CRUD | ✅ Counter Enrollment |
| **Supplier Registry (`/suppliers`)** | ✅ Full CRUD | ✅ View Only | ❌ Restricted |
| **Promotions & Coupon Offers** | ✅ Full CRUD | ✅ Create / Edit | 👁️ View & Apply Only |
| **Store Branch Switching** | ✅ Allowed | ✅ Assigned Outlets | 🔒 Locked to Desk |

### 📊 Staff Sales Performance Tracking:
The User Management Page (`UserManagementPage.tsx`) dynamically sums real-time completed sales transactions from the database per staff account, showing actual `Total Sales Count` and `Total Revenue Generated` without dummy numbers.

---

## 🛒 Modern POS Counter Billing & Checkout Flow

The POS Checkout Terminal (`CreateSalePage.tsx`) is designed for maximum speed, visual clarity, and cashier efficiency.

```
+---------------------------------------+---------------------------------------+
|  LEFT CATALOGUE PANEL                 |  RIGHT CHECKOUT & PAYMENT PANEL       |
|  - Search Input (F1)                  |  - Customer Account Link (F3)         |
|  - Category Pills (Groceries, Dairy)  |  - Active Promotions & Coupon Dropdown|
|  - Touch Product Cards Grid           |  - Manual Discount (% or Tk)          |
|  - Active Cart Table (F2 Clear)       |  - Payment Method (F4 Cash, F5 Card)  |
|                                       |  - Cash Tendered & Change Return      |
|                                       |  - Process Payment Button (F9)        |
+---------------------------------------+---------------------------------------+
```

### 📋 Checkout Step-by-Step Flow:
1. **Product Selection**:
   - Tap product cards on the Touch Catalogue Grid, scan physical barcode using hardware USB/Bluetooth scanner, or click Camera Scan (`F10`).
   - Filter items by Category Pills (`Groceries`, `Electronics`, `Dairy`, `Beverages`, `Bakery`) or Supplier Dropdown.
2. **Quantity Adjustment**:
   - Adjust cart quantities using numeric stepper or enter precise decimal values for loose weight items.
3. **Discount & Coupon Application**:
   - Select active promotional offers or enter a manual custom discount in percentage (`%`) or flat Taka (`Tk`).
4. **Customer Linking**:
   - Search and link customer phone/name (`F3`) to award loyalty reward points.
5. **Payment Processing**:
   - Choose Payment Method: **Cash (`F4`)**, **Card (`F5`)**, or **Mobile Banking (`F6`)**.
   - For cash sales, select preset quick-tender buttons (`Tk 100`, `Tk 500`, `Tk 1000`) or enter exact cash received. The system instantly calculates and displays **Change Due Return**.
6. **Receipt Generation**:
   - Press **Process Payment (`F9`)**. The system updates stock in Neon DB and prompts 1-click **Thermal Print Receipt** or **PDF Memo Download**.

---

## ⚖️ Loose Weight & Variable Fraction Billing

Superstore groceries (Rice, Sugar, Mustard Oil) are frequently sold by exact weight (e.g. `1.5 Kg`, `0.5 Kg`, `3.10 Kg`) rather than fixed pre-packed containers.

### 🌾 How POSBuzz Manages Loose Weight:
- **Per-Unit Pricing Standard**: Groceries use per-unit base rates (e.g., `Miniket Premium Parboiled Rice (Per Kg)` at `Tk 76.00 / Kg`).
- **Decimal Quantity Stepper**: Cart input fields allow fraction inputs with `0.01` precision and `0.5` step increments.
- **Accurate Subtotal Calculation**:
  $$\text{Subtotal} = \text{Weight (Kg)} \times \text{Unit Price (Tk/Kg)}$$
  *Example*: $3.10\text{ Kg} \times \text{Tk } 76.00 = \text{Tk } 235.60$.

---

## 🖨️ Vector CODE128 Barcode Sticker Printing Engine

POSBuzz includes an embedded vector CODE128 barcode label printing system (`utils/barcode.ts` and `BarcodePrintModal.tsx`).

### 📦 Supported Sticker Print Modes:

1. **A4 Sheet Grid Printing (24 Labels / Sheet)**:
   - Formats 24 sticker labels on a standard A4 sheet for standard HP, Canon, or Epson desktop printers.
2. **Thermal Label Printing (50mm x 30mm)**:
   - Precise single/continuous roll label dimensions for dedicated barcode sticker printers (Xprinter, Zebra, TSC).

### 🔍 Technical Highlights:
- **High-DPI SVG Vector Rendering**: Barcode bars are generated as pure mathematical SVG vectors rather than text approximations, guaranteeing **0.1-second hardware scanner reading rate**.
- **Sticker Metadata**: Every sticker includes Store Brand Name, Product Title, Price in BDT (`Tk 240.00 / Pcs`), SVG Barcode, and SKU Code.

---

## 💵 Cash Till Shift & Reconciliation Engine

To prevent cash drawer discrepancies, POSBuzz implements a till shift management workflow for cashiers.

1. **Shift Opening**: Cashier starts shift with an opening cash float (e.g., `Tk 10,000.00`).
2. **Shift Operations**: System tracks all cash sales processed during the active shift.
3. **Shift Closing & Reconciliation**:
   $$\text{Expected Till Balance} = \text{Opening Float} + \text{Total Cash Sales}$$
   - Cashier enters physical counted cash.
   - System calculates discrepancy:
     - **Surplus (`+Tk 200.00`)**
     - **Shortage (`-Tk 150.00`)**
     - **Perfect Match (`Tk 0.00`)**

---

## ⌨️ POS Counter Keyboard Shortcuts Guide

Cashiers can operate the entire checkout terminal using function keys:

| Shortcut Key | Visual UI Badge | Action & Function Description |
| :--- | :---: | :--- |
| **`F1`** | `F1` | **Focus Product Search Box** (Instant cursor focus) |
| **`F2`** | `F2` | **Clear / Reset Active Order Cart** |
| **`F3`** | `F3` | **Focus Customer Account Link Selection** |
| **`F4`** | `F4` | **Select Payment Method to CASH** |
| **`F5`** | `F5` | **Select Payment Method to CARD** |
| **`F6`** | `F6` | **Select Payment Method to MOBILE / OTHER** |
| **`F8`** | `F8` | **Quick Cash Preset (Tender Tk 1000)** |
| **`F9`** | `F9` | **Process Payment & Print Official Receipt** |
| **`F10`** | `F10` | **Toggle Camera Barcode Scanner** |
| **`ESC`** | `ESC` | **Reset Order Cart / Close Open Modals** |
| **`Hardware Scanner`** | `USB/BT` | **Auto Scan & Add Item Directly to Cart** |

---

## ⚡ High-Performance Caching & Performance Architecture

POSBuzz achieves sub-millisecond UI page transitions and instant data loading through a multi-tier caching strategy.

1. **10-Minute RAM Memory Cache (`main.tsx`)**:
   - TanStack Query is configured with `staleTime: 10 * 60 * 1000` and `refetchOnMount: false`. Data loaded once remains in memory for 10 minutes, eliminating page switching spinners.
2. **3-Second Network Timeout (`utils/axios.ts`)**:
   - Axios instance enforces a 3-second timeout. If backend latency occurs, the system seamlessly falls back to cached data to prevent UI freezes.

---

## 💻 Technology Stack & System Requirements

### 🎨 Frontend Frameworks:
- **Core**: React 18 + TypeScript + Vite
- **UI System**: Ant Design 5 (Curated Dark/Light Mode with `#d6d750` Primary Accent)
- **Data Management**: TanStack React Query v5
- **Data Visualization**: Recharts
- **PDF & Invoice Generation**: jsPDF + autoTable

### ⚙️ Backend & Infrastructure:
- **Framework**: NestJS + TypeScript
- **Database & ORM**: PostgreSQL (Hosted on Neon Cloud) + Prisma ORM
- **Cache & Session**: Redis (Hosted on Upstash Cloud)
- **Authentication**: JWT + Passport + Bcrypt Password Hashing

---

## 🚀 Local Development & Cloud Deployment Guide

### 1. Repository Setup
```bash
git clone https://github.com/nokib-web/PosBuzz.git
cd PosBuzz
```

### 2. Backend Environment & Database Seeding
```bash
cd backend
npm install

# Create .env file with DATABASE_URL:
# DATABASE_URL="postgresql://neondb_owner:npg_NY1Z9cHBGPmT@ep-soft-tooth-ayq7cec0.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Push Prisma Schema & Run Database Seed
npx prisma db push
npx prisma db seed

# Start NestJS Backend Server
npm run start:dev
```

### 3. Frontend Setup & Run
```bash
cd ../frontend
npm install

# Start Vite Frontend Server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Login Credentials

| Role | Username / Email | Password | Assigned Permissions |
| :--- | :--- | :--- | :--- |
| **Admin Executive** | `admin` / `admin@posbuzz.com` | `admin123` | Full Enterprise & Outlets Control |
| **Store Manager** | `rahim_ctg` / `manager@posbuzz.com` | `manager123` | Outlet Operations & Inventory |
| **Front-Desk Cashier**| `karim_desk` / `employee@gmail.com` | `cashier123` | Counter POS Terminal Checkout |

---

## 📄 License & Maintainers

Developed with ❤️ by **Deepmind Team / Nokib Web**. Engineered for enterprise reliability, high-speed retail operations, and modern commerce.
