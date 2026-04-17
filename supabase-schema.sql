-- LUX PET PLAST - Supabase Schema

-- Mijozlar jadvali
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  email VARCHAR(255),
  debt_uzs DECIMAL(15,2) DEFAULT 0,
  debt_usd DECIMAL(15,2) DEFAULT 0,
  total_purchases DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mahsulotlar jadvali
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  warehouse VARCHAR(50) DEFAULT 'preform',
  sub_type VARCHAR(50),
  units_per_bag INTEGER DEFAULT 2000,
  price_per_bag DECIMAL(15,2),
  current_stock DECIMAL(15,2) DEFAULT 0,
  min_stock DECIMAL(15,2) DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'qop',
  barcode VARCHAR(100),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sotuvlar jadvali
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number VARCHAR(50) UNIQUE,
  customer_id UUID REFERENCES customers(id),
  items JSONB NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  paid_amount DECIMAL(15,2) DEFAULT 0,
  debt_amount DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'UZS',
  payment_details JSONB,
  is_kocha BOOLEAN DEFAULT false,
  manual_customer_name VARCHAR(255),
  manual_customer_phone VARCHAR(20),
  cashier_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buyurtmalar jadvali
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  customer_id UUID REFERENCES customers(id),
  items JSONB NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  delivery_address TEXT,
  notes TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Xarajatlar jadvali
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'UZS',
  category VARCHAR(100),
  expense_date DATE,
  receipt_url TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kassa jadvali
CREATE TABLE IF NOT EXISTS cashbox (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_type VARCHAR(20) NOT NULL, -- 'income', 'expense'
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'UZS',
  description TEXT,
  reference_id UUID, -- sales, expenses, orders jadvallari bilan bog'lash
  reference_table VARCHAR(50),
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexlar
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_warehouse ON products(warehouse);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_cashbox_transaction_type ON cashbox(transaction_type);
CREATE INDEX IF NOT EXISTS idx_cashbox_created_at ON cashbox(created_at);

-- RLS (Row Level Security) - Faqat autentifikatsiyadan o'tgan foydalanuvchilar ko'ra oladi
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashbox ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all customers" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert customers" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update customers" ON customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete customers" ON customers FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all products" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all sales" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert sales" ON sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update sales" ON sales FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert orders" ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all expenses" ON expenses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert expenses" ON expenses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update expenses" ON expenses FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all cashbox" ON cashbox FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert cashbox" ON cashbox FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
