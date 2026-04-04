# Lux Pet Plast ERP

A professional, production-ready ERP system for plastic preform manufacturing and wholesale trading.

## 🎉 Latest Updates (v2.0)

### 🧠 AI Analytics System
- 15+ advanced metrics (CLV, ROI, Churn Rate, etc.)
- Customer segmentation (VIP, Loyal, Regular, At-Risk, Inactive)
- Anomaly detection (revenue spikes/drops)
- Risk assessment (Financial, Customer, Operational, Market)
- Strategic recommendations (Growth, Retention, Efficiency, Pricing, Risk)
- AI confidence score (0-100%)

### 📦 Inventory Unit Management
- Unit-level inventory tracking
- Add/remove units with full history
- Automatic bag ↔ unit conversion
- Movement history (who, when, what, why)
- Detailed timestamps for all actions

### ⏰ Time & Date System
- Precise timestamps (second accuracy)
- 5 different time formats
- Relative time ("5 minutes ago")
- Smart format ("Today, 14:30:45")
- Full Uzbek localization
- Reusable TimeStamp components

## Features

### Core Modules

1. **Warehouse Management (Bag-Based System)**
   - Products stored and sold by BAG
   - Real-time stock tracking with automatic decrease
   - Alert system (yellow/red/block)
   - Batch tracking with production details
   - Automatic unit calculation
   - **NEW:** Unit-level management with full history

2. **Sales System**
   - Multiple products per sale
   - Custom pricing per bag
   - Stock validation before sale
   - Automatic invoice generation
   - Telegram integration ready

3. **Cashbox & Expense Analytics**
   - Multi-currency support (UZS, USD, CLICK)
   - Category-based expense tracking
   - Real-time profit calculation
   - Financial dashboard with charts
   - Transaction history with filters
   - **NEW:** Advanced AI analytics with 15+ metrics

4. **AI Sales Forecasting**
   - Historical sales analysis
   - Stock depletion prediction
   - Monthly demand forecast
   - Fast/slow moving product identification
   - Optimal production planning
   - **NEW:** Anomaly detection and risk assessment

5. **Customer Management (CRM)**
   - Balance and debt tracking
   - Sales and payment history
   - Customer categorization (VIP/Normal/Risk)
   - Automated alerts
   - Customer portal ready
   - **NEW:** AI-powered customer segmentation

6. **Telegram Bot Integration** 🤖
   - Automatic receipt delivery to customers
   - Real-time balance and debt checking
   - Order history viewing
   - Payment confirmation notifications
   - 24/7 customer self-service
   - Multi-currency payment details (UZS, USD, CLICK)

7. **Roles & Permissions**
   - Admin, Seller, Warehouse Manager, Accountant
   - Role-based access control

8. **Dashboard**
   - Real-time metrics
   - Revenue and profit tracking
   - Top customers and products
   - Low stock alerts
   - Forecast summary

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Custom Components
- **State**: Zustand
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT
- **Charts**: Recharts

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd luxpetplast-erp
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
```

Edit `.env` with your database credentials and secrets.

4. Setup database
```bash
npm run db:generate
npm run db:push
```

5. Create initial admin user (optional - use Prisma Studio or SQL)
```sql
INSERT INTO "User" (id, email, password, name, role, active)
VALUES (
  gen_random_uuid(),
  'admin@luxpetplast.uz',
  '$2a$10$YourHashedPasswordHere',
  'Admin',
  'ADMIN',
  true
);
```

Or use bcrypt to hash password:
```javascript
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('your-password', 10));
```

6. Start development servers
```bash
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:5000

## Production Deployment

### Build

```bash
npm run build
```

### Environment Variables

Set these in production:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random secret
- `NODE_ENV=production`
- `PORT`: Server port (default 5000)

### Database Migration

```bash
npm run db:push
```

### Start Server

```bash
node server/index.js
```

Serve the `dist` folder with nginx or similar.

## API Documentation

### Authentication

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "password",
  "name": "User Name",
  "role": "SELLER"
}
```

### Products

**GET** `/api/products` - List all products
**POST** `/api/products` - Create product
**PUT** `/api/products/:id` - Update product
**POST** `/api/products/:id/batch` - Add batch
**GET** `/api/products/alerts` - Get stock alerts

### Sales

**GET** `/api/sales` - List sales
**POST** `/api/sales` - Create sale

### Customers

**GET** `/api/customers` - List customers
**POST** `/api/customers` - Create customer
**GET** `/api/customers/:id` - Get customer details
**POST** `/api/customers/:id/payment` - Record payment
**GET** `/api/customers/alerts/overdue` - Get overdue alerts

### Expenses

**GET** `/api/expenses` - List expenses
**POST** `/api/expenses` - Create expense
**GET** `/api/expenses/summary` - Get summary

### Dashboard

**GET** `/api/dashboard/stats` - Get dashboard statistics

### Forecast

**GET** `/api/forecast/overview` - Get forecast overview
**GET** `/api/forecast/demand/:productId` - Get product forecast

## Features Roadmap

- [ ] Telegram bot integration
- [ ] Customer portal
- [ ] Multi-branch support
- [ ] Advanced reporting
- [ ] Export to Excel/PDF
- [ ] Email notifications
- [ ] Mobile app
- [ ] Barcode scanning
- [ ] Production planning module

## License

Proprietary - Lux Pet Plast

## Support

For support, contact: admin@luxpetplast.uz
