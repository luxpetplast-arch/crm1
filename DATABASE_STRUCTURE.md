# LUX PET PLAST - DATABASE STRUCTURE (SQL)

## MA'LUMOTLAR TURILARI - SQL FORMAT

---

## **1. CUSTOMERS TABLE (MIJOZLAR)**

```sql
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    company VARCHAR(255),
    tax_number VARCHAR(50),
    credit_limit DECIMAL(15, 2) DEFAULT 0.00,
    current_balance DECIMAL(15, 2) DEFAULT 0.00,
    status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    product_prices TEXT, -- JSON format: {"product_id": "price", ...}
    notes TEXT,
    payment_terms INT DEFAULT 30, -- kunlarda
    last_purchase_date DATE,
    total_purchases DECIMAL(15, 2) DEFAULT 0.00,
    loyalty_points INT DEFAULT 0,
    discount_rate DECIMAL(5, 2) DEFAULT 0.00
);
```

---

## **2. PRODUCTS TABLE (MAHSULOTLAR)**

```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'kg',
    price DECIMAL(15, 2) NOT NULL,
    cost_price DECIMAL(15, 2),
    warehouse VARCHAR(100),
    current_stock DECIMAL(15, 2) DEFAULT 0.00,
    min_stock DECIMAL(15, 2) DEFAULT 0.00,
    max_stock DECIMAL(15, 2),
    reorder_point DECIMAL(15, 2),
    supplier_id INT,
    status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    weight DECIMAL(10, 3),
    dimensions VARCHAR(50), -- "20x30x40"
    shelf_location VARCHAR(50),
    expiry_date DATE,
    batch_number VARCHAR(50),
    storage_conditions TEXT,
    quality_grade VARCHAR(20),
    is_hazardous BOOLEAN DEFAULT FALSE,
    safety_data TEXT,
    image_url VARCHAR(500),
    tags TEXT,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
```

---

## **3. SALES TABLE (SOTUVLAR)**

```sql
CREATE TABLE sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    total_amount DECIMAL(15, 2) NOT NULL,
    payment_method ENUM('cash', 'card', 'transfer', 'credit', 'mixed'),
    payment_status ENUM('paid', 'partial', 'unpaid', 'overdue') DEFAULT 'unpaid',
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_by INT,
    notes TEXT,
    delivery_address TEXT,
    delivery_date DATE,
    shipping_cost DECIMAL(15, 2) DEFAULT 0.00,
    commission_rate DECIMAL(5, 2) DEFAULT 0.00,
    commission_amount DECIMAL(15, 2) DEFAULT 0.00,
    due_date DATE,
    paid_amount DECIMAL(15, 2) DEFAULT 0.00,
    balance_amount DECIMAL(15, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## **4. SALE_ITEMS TABLE (SOTUV ITEMLARI)**

```sql
CREATE TABLE sale_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(15, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    warehouse VARCHAR(100),
    batch_number VARCHAR(50),
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## **5. INVENTORY TABLE (INVENTAR)**

```sql
CREATE TABLE inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    warehouse VARCHAR(100) NOT NULL,
    quantity DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    reserved_quantity DECIMAL(15, 2) DEFAULT 0.00,
    available_quantity DECIMAL(15, 2) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    min_stock DECIMAL(15, 2) DEFAULT 0.00,
    max_stock DECIMAL(15, 2),
    reorder_point DECIMAL(15, 2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    batch_number VARCHAR(50),
    expiry_date DATE,
    location VARCHAR(100),
    cost_per_unit DECIMAL(15, 2),
    total_cost DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * cost_per_unit) STORED,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    UNIQUE KEY unique_product_warehouse (product_id, warehouse)
);
```

---

## **6. SUPPLIERS TABLE (TA'MINOTCHILAR)**

```sql
CREATE TABLE suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    tax_number VARCHAR(50),
    payment_terms INT DEFAULT 30,
    credit_limit DECIMAL(15, 2) DEFAULT 0.00,
    status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    contact_person VARCHAR(255),
    website VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 5.00,
    notes TEXT,
    bank_account VARCHAR(100),
    swift_code VARCHAR(20),
    delivery_time INT DEFAULT 7, -- kunlarda
    min_order_amount DECIMAL(15, 2),
    product_categories TEXT, -- JSON format
    certifications TEXT
);
```

---

## **7. FINANCIAL TABLE (MOLIYAVIY)**

```sql
CREATE TABLE financial_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('income', 'expense', 'transfer') NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'UZS',
    description TEXT,
    reference_id INT, -- related to sales, purchases, etc.
    reference_type VARCHAR(50), -- 'sale', 'purchase', 'salary', etc.
    account VARCHAR(100),
    payment_method ENUM('cash', 'card', 'transfer', 'check', 'other'),
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    notes TEXT,
    attachments TEXT, -- JSON array of file paths
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    net_amount DECIMAL(15, 2) GENERATED ALWAYS AS (amount - tax_amount) STORED,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

---

## **8. USERS TABLE (FOYDALANUVCHILAR)**

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    role ENUM('admin', 'manager', 'cashier', 'seller', 'operator', 'accountant') NOT NULL,
    phone VARCHAR(20),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    permissions TEXT, -- JSON format
    department VARCHAR(100),
    position VARCHAR(100),
    salary DECIMAL(15, 2),
    hire_date DATE,
    birth_date DATE,
    address TEXT,
    emergency_contact VARCHAR(255),
    profile_image VARCHAR(500),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(100),
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL
);
```

---

## **9. BACKUP_LOGS TABLE (BACKUP LOGLARI)**

```sql
CREATE TABLE backup_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    backup_type ENUM('full', 'incremental', 'differential') NOT NULL,
    backup_method ENUM('local', 'cloud', 'hybrid') NOT NULL,
    cloud_provider VARCHAR(50),
    backup_path VARCHAR(500),
    file_count INT,
    total_size DECIMAL(15, 2),
    compressed_size DECIMAL(15, 2),
    compression_ratio DECIMAL(5, 2),
    status ENUM('started', 'running', 'completed', 'failed', 'cancelled') NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    duration_seconds INT,
    error_message TEXT,
    created_by INT,
    checksum VARCHAR(64),
    encryption_enabled BOOLEAN DEFAULT FALSE,
    encryption_algorithm VARCHAR(50),
    backup_id VARCHAR(100) UNIQUE,
    parent_backup_id INT, -- For incremental backups
    metadata TEXT, -- JSON format
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (parent_backup_id) REFERENCES backup_logs(id)
);
```

---

## **10. SYSTEM_SETTINGS TABLE (SYSTEM SOZLAMALARI)**

```sql
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',
    description TEXT,
    category VARCHAR(50),
    is_editable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    validation_rules TEXT, -- JSON format
    default_value TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

---

## **11. AUDIT_LOG TABLE (AUDIT LOG)**

```sql
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values TEXT, -- JSON format
    new_values TEXT, -- JSON format
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## **12. NOTIFICATIONS TABLE (XABARNOMALAR)**

```sql
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error', 'system') DEFAULT 'info',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    archived_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    metadata TEXT, -- JSON format
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## **13. EXPENSES TABLE (XARAJATLAR)**

```sql
CREATE TABLE expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expense_id VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'UZS',
    description TEXT,
    expense_date DATE,
    payment_method ENUM('cash', 'card', 'transfer', 'check', 'other'),
    status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
    receipt_number VARCHAR(100),
    vendor_supplier VARCHAR(255),
    created_by INT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    notes TEXT,
    attachments TEXT, -- JSON array of file paths
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    total_amount DECIMAL(15, 2) GENERATED ALWAYS AS (amount + tax_amount) STORED,
    project_code VARCHAR(50),
    department VARCHAR(100),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

---

## **14. PRODUCTION TABLE (ISHLAB CHIQARISH)**

```sql
CREATE TABLE production (
    id INT PRIMARY KEY AUTO_INCREMENT,
    production_id VARCHAR(50) UNIQUE NOT NULL,
    product_id INT NOT NULL,
    batch_number VARCHAR(50),
    quantity_produced DECIMAL(15, 2) NOT NULL,
    quantity_defective DECIMAL(15, 2) DEFAULT 0.00,
    quantity_good DECIMAL(15, 2) GENERATED ALWAYS AS (quantity_produced - quantity_defective) STORED,
    production_date DATE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INT,
    status ENUM('planned', 'in_progress', 'completed', 'paused', 'cancelled') DEFAULT 'planned',
    machine_id VARCHAR(50),
    operator_id INT,
    supervisor_id INT,
    quality_grade VARCHAR(20),
    notes TEXT,
    materials_used TEXT, -- JSON format
    cost_per_unit DECIMAL(15, 2),
    total_cost DECIMAL(15, 2) GENERATED ALWAYS AS (quantity_produced * cost_per_unit) STORED,
    warehouse VARCHAR(100),
    expiry_date DATE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (operator_id) REFERENCES users(id),
    FOREIGN KEY (supervisor_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## **15. WAREHOUSE TABLE (OMBORLAR)**

```sql
CREATE TABLE warehouses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    type ENUM('main', 'branch', 'virtual', 'external') DEFAULT 'main',
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    manager_id INT,
    capacity DECIMAL(15, 2),
    current_usage DECIMAL(15, 2) DEFAULT 0.00,
    usage_percentage DECIMAL(5, 2) GENERATED ALWAYS AS ((current_usage / capacity) * 100) STORED,
    temperature_range VARCHAR(50),
    humidity_range VARCHAR(50),
    security_level ENUM('low', 'medium', 'high', 'restricted') DEFAULT 'medium',
    operating_hours VARCHAR(100),
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (manager_id) REFERENCES users(id)
);
```

---

## **16. QUALITY_CONTROL TABLE (SIFAT NAZORATI)**

```sql
CREATE TABLE quality_control (
    id INT PRIMARY KEY AUTO_INCREMENT,
    qc_id VARCHAR(50) UNIQUE NOT NULL,
    product_id INT NOT NULL,
    batch_number VARCHAR(50),
    inspection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    inspector_id INT,
    status ENUM('pending', 'passed', 'failed', 'conditional') DEFAULT 'pending',
    test_results TEXT, -- JSON format
    defects_found TEXT, -- JSON format
    quality_score DECIMAL(5, 2),
    standards_met TEXT, -- JSON array
    recommendations TEXT,
    corrective_actions TEXT,
    next_inspection_date DATE,
    sample_size INT,
    defect_rate DECIMAL(5, 2),
    approved_by INT,
    approved_at TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (inspector_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

---

## **17. LOGISTICS TABLE (LOGISTIKA)**

```sql
CREATE TABLE logistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shipment_id VARCHAR(50) UNIQUE NOT NULL,
    order_id INT,
    customer_id INT,
    shipment_type ENUM('delivery', 'pickup', 'transfer', 'return') DEFAULT 'delivery',
    origin_address TEXT,
    destination_address TEXT,
    shipment_date DATE,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    status ENUM('pending', 'in_transit', 'delivered', 'delayed', 'cancelled', 'returned') DEFAULT 'pending',
    carrier_company VARCHAR(255),
    tracking_number VARCHAR(100),
    driver_id INT,
    vehicle VARCHAR(100),
    weight DECIMAL(15, 2),
    volume DECIMAL(15, 2),
    shipping_cost DECIMAL(15, 2),
    insurance_cost DECIMAL(15, 2) DEFAULT 0.00,
    total_cost DECIMAL(15, 2) GENERATED ALWAYS AS (shipping_cost + insurance_cost) STORED,
    payment_method ENUM('prepaid', 'cod', 'account') DEFAULT 'prepaid',
    delivery_instructions TEXT,
    special_requirements TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES sales(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (driver_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## **18. TASKS TABLE (VAZIFALAR)**

```sql
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('todo', 'in_progress', 'review', 'completed', 'cancelled') DEFAULT 'todo',
    assigned_to INT,
    created_by INT,
    due_date DATE,
    completed_date DATE,
    estimated_hours DECIMAL(5, 2),
    actual_hours DECIMAL(5, 2),
    progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
    category VARCHAR(100),
    tags TEXT, -- JSON array
    attachments TEXT, -- JSON array of file paths
    dependencies TEXT, -- JSON array of task IDs
    parent_task_id INT,
    recurrence_rule TEXT, -- JSON format for recurring tasks
    reminder_date TIMESTAMP,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_by INT,
    notes TEXT,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id),
    FOREIGN KEY (completed_by) REFERENCES users(id)
);
```

---

## **19. CASHBOX TABLE (KASSA)**

```sql
CREATE TABLE cashbox (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cashbox_id VARCHAR(50) UNIQUE NOT NULL,
    shift_id VARCHAR(50),
    cashier_id INT,
    opening_balance DECIMAL(15, 2) NOT NULL,
    closing_balance DECIMAL(15, 2),
    cash_sales DECIMAL(15, 2) DEFAULT 0.00,
    card_sales DECIMAL(15, 2) DEFAULT 0.00,
    transfer_sales DECIMAL(15, 2) DEFAULT 0.00,
    total_sales DECIMAL(15, 2) GENERATED ALWAYS AS (cash_sales + card_sales + transfer_sales) STORED,
    cash_expenses DECIMAL(15, 2) DEFAULT 0.00,
    cash_in DECIMAL(15, 2) DEFAULT 0.00,
    cash_out DECIMAL(15, 2) DEFAULT 0.00,
    expected_closing DECIMAL(15, 2) GENERATED ALWAYS AS (opening_balance + cash_sales - cash_expenses + cash_in - cash_out) STORED,
    difference DECIMAL(15, 2) GENERATED ALWAYS AS (closing_balance - expected_closing) STORED,
    shift_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shift_end TIMESTAMP NULL,
    status ENUM('open', 'closed', 'pending_review') DEFAULT 'open',
    notes TEXT,
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cashier_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

---

## **20. REPORTS TABLE (REPORTLAR)**

```sql
CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('sales', 'inventory', 'financial', 'production', 'quality', 'logistics', 'custom') NOT NULL,
    format ENUM('pdf', 'excel', 'csv', 'json') DEFAULT 'pdf',
    parameters TEXT, -- JSON format
    filters TEXT, -- JSON format
    generated_by INT,
    generation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500),
    file_size DECIMAL(15, 2),
    status ENUM('generating', 'completed', 'failed', 'cancelled') DEFAULT 'generating',
    error_message TEXT,
    scheduled BOOLEAN DEFAULT FALSE,
    schedule_frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
    next_run_date TIMESTAMP,
    recipients TEXT, -- JSON array of email addresses
    is_public BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NULL,
    download_count INT DEFAULT 0,
    last_downloaded TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id)
);
```

---

## **INDEXLAR (PERFORMANS UCHUN)**

```sql
-- Customer indexes
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_status ON customers(status);

-- Product indexes
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_warehouse ON products(warehouse);
CREATE INDEX idx_products_status ON products(status);

-- Sales indexes
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_payment_status ON sales(payment_status);
CREATE INDEX idx_sales_invoice ON sales(invoice_number);

-- Sale items indexes
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
CREATE INDEX idx_sale_items_warehouse ON sale_items(warehouse);

-- Inventory indexes
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);

-- Financial indexes
CREATE INDEX idx_financial_date ON financial_transactions(transaction_date);
CREATE INDEX idx_financial_type ON financial_transactions(type);
CREATE INDEX idx_financial_category ON financial_transactions(category);
CREATE INDEX idx_financial_status ON financial_transactions(status);

-- Users indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Backup logs indexes
CREATE INDEX idx_backup_logs_date ON backup_logs(start_time);
CREATE INDEX idx_backup_logs_type ON backup_logs(backup_type);
CREATE INDEX idx_backup_logs_status ON backup_logs(status);
CREATE INDEX idx_backup_logs_provider ON backup_logs(cloud_provider);
```

---

## **TRIGGERS (AVTOMATIK AMALLAR)**

```sql
-- Customer balance update trigger
DELIMITER //
CREATE TRIGGER update_customer_balance_after_sale
    AFTER INSERT ON sale_items
    FOR EACH ROW
BEGIN
    UPDATE customers 
    SET current_balance = current_balance + NEW.total_price,
        total_purchases = total_purchases + NEW.total_price,
        last_purchase_date = CURDATE()
    WHERE id = (SELECT customer_id FROM sales WHERE id = NEW.sale_id);
END//
DELIMITER ;

-- Inventory update trigger
DELIMITER //
CREATE TRIGGER update_inventory_after_sale
    AFTER INSERT ON sale_items
    FOR EACH ROW
BEGIN
    UPDATE inventory 
    SET quantity = quantity - NEW.quantity,
        last_updated = CURRENT_TIMESTAMP
    WHERE product_id = NEW.product_id AND warehouse = NEW.warehouse;
END//
DELIMITER ;

-- Audit log trigger
DELIMITER //
CREATE TRIGGER log_customer_changes
    AFTER UPDATE ON customers
    FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
        NULL, -- This would be set by the application
        'UPDATE',
        'customers',
        NEW.id,
        JSON_OBJECT(
            'name', OLD.name,
            'phone', OLD.phone,
            'email', OLD.email,
            'status', OLD.status
        ),
        JSON_OBJECT(
            'name', NEW.name,
            'phone', NEW.phone,
            'email', NEW.email,
            'status', NEW.status
        )
    );
END//
DELIMITER ;
```

---

## **VIEWS (QO'SHMA MA'LUMOTLAR)**

```sql
-- Customer summary view
CREATE VIEW customer_summary AS
SELECT 
    c.id,
    c.name,
    c.phone,
    c.email,
    c.current_balance,
    c.total_purchases,
    c.last_purchase_date,
    COUNT(s.id) as total_orders,
    SUM(s.total_amount) as total_spent,
    AVG(s.total_amount) as average_order_value
FROM customers c
LEFT JOIN sales s ON c.id = s.customer_id
GROUP BY c.id, c.name, c.phone, c.email, c.current_balance, c.total_purchases, c.last_purchase_date;

-- Product summary view
CREATE VIEW product_summary AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.category,
    p.price,
    p.cost_price,
    COALESCE(SUM(i.quantity), 0) as total_stock,
    COALESCE(SUM(si.quantity), 0) as total_sold,
    COUNT(si.id) as sale_count,
    COALESCE(AVG(si.unit_price), p.price) as average_sale_price
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
LEFT JOIN sale_items si ON p.id = si.product_id
GROUP BY p.id, p.name, p.sku, p.category, p.price, p.cost_price;

-- Daily sales summary view
CREATE VIEW daily_sales_summary AS
SELECT 
    DATE(sale_date) as sale_date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value,
    COUNT(DISTINCT customer_id) as unique_customers,
    SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END) as cash_sales,
    SUM(CASE WHEN payment_method = 'card' THEN total_amount ELSE 0 END) as card_sales,
    SUM(CASE WHEN payment_method = 'transfer' THEN total_amount ELSE 0 END) as transfer_sales
FROM sales
WHERE status = 'confirmed'
GROUP BY DATE(sale_date);
```

---

## **STORED PROCEDURES (SAQLANGAN PROSEDURALAR)**

```sql
-- Customer balance update procedure
DELIMITER //
CREATE PROCEDURE update_customer_balance(
    IN customer_id INT,
    IN amount DECIMAL(15, 2),
    IN transaction_type VARCHAR(20) -- 'credit' or 'debit'
)
BEGIN
    IF transaction_type = 'credit' THEN
        UPDATE customers 
        SET current_balance = current_balance + amount
        WHERE id = customer_id;
    ELSEIF transaction_type = 'debit' THEN
        UPDATE customers 
        SET current_balance = current_balance - amount
        WHERE id = customer_id;
    END IF;
END//
DELIMITER ;

-- Inventory transfer procedure
DELIMITER //
CREATE PROCEDURE transfer_inventory(
    IN product_id INT,
    IN from_warehouse VARCHAR(100),
    IN to_warehouse VARCHAR(100),
    IN quantity DECIMAL(15, 2),
    IN user_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Decrease from source warehouse
    UPDATE inventory 
    SET quantity = quantity - quantity,
        last_updated = CURRENT_TIMESTAMP,
        updated_by = user_id
    WHERE product_id = product_id AND warehouse = from_warehouse;

    -- Increase to destination warehouse
    INSERT INTO inventory (product_id, warehouse, quantity, last_updated, updated_by)
    VALUES (product_id, to_warehouse, quantity, CURRENT_TIMESTAMP, user_id)
    ON DUPLICATE KEY UPDATE 
        quantity = quantity + quantity,
        last_updated = CURRENT_TIMESTAMP,
        updated_by = user_id;

    COMMIT;
END//
DELIMITER ;
```

---

## **XULOSA - MA'LUMOTLAR TURILARI:**

### **ASOSIY MA'LUMOTLAR:**
- **customers** - Mijozlar ma'lumotlari
- **products** - Mahsulotlar ma'lumotlari
- **sales** - Sotuvlar ma'lumotlari
- **inventory** - Inventar ma'lumotlari
- **financial** - Moliyaviy ma'lumotlar

### **QO'SHIMCHA MA'LUMOTLAR:**
- **suppliers** - Ta'minotchilar
- **users** - Foydalanuvchilar
- **backup_logs** - Backup loglari
- **system_settings** - System sozlamalari
- **audit_log** - Audit loglari
- **notifications** - Xabarnomalar
- **expenses** - Xarajatlar
- **production** - Ishlab chiqarish
- **warehouses** - Omborlar
- **quality_control** - Sifat nazorati
- **logistics** - Logistika
- **tasks** - Vazifalar
- **cashbox** - Kassa
- **reports** - Reportlar

### **BARCHASI SQL FORMATDA!**

**MA'LUMOTLAR ENDI SQL TURIDA SAQLANADI!**

**PROFESSIONAL DATABASE STRUCTURE!**

**OPTIMIZED INDEXLAR!**

**TRIGGERS VA VIEWS!**

**STORED PROCEDURES!**

#DatabaseStructure #SQL #ProfessionalDB #DataStructure
