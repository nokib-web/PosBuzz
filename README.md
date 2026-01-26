# 🐝 POSBuzz - Point of Sale System

POSBuzz is a modern, comprehensive Point of Sale (POS) system designed for maximum efficiency, scalability, and ease of use. It leverages a monorepo architecture to streamline development across both the frontend and backend services.

## 🚀 Project Overview

- **Frontend**: A high-performance user interface built with modern web technologies.
- **Backend**: A robust API service handling business logic, inventory, and sales transactions.

## 📁 Monorepo Structure

```text
posbuzz/
├── frontend/         # React-based customer/admin interface
├── backend/          # Node.js/Express API service
├── package.json      # Root configuration & workspace scripts
└── .gitignore        # Global exclusion rules
```

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Installation

Clone the repository and install all dependencies for the entire workspace:

```bash
npm run install:all
```

### Development

To run both services in parallel during development:

```bash
npm run dev
```

Or run them individually:

```bash
# Start frontend only
npm run frontend

# Start backend only
npm run backend
```

### Production

To prepare the system for production:

```bash
# Build all workspaces
npm run build

# Start the production services
npm start
```

## 📜 License

This project is licensed under the ISC License.
