-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    document TEXT,
    address TEXT,
    city TEXT,
    contact_name TEXT,
    contact TEXT,
    email TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_amount DECIMAL(10, 2),
    recurring_installments INTEGER,
    recurring_cycle_start TEXT,
    paid_installments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    serial_number TEXT,
    expiry_date TEXT,
    category TEXT,
    unit_of_measure TEXT,
    cost_price DECIMAL(10, 2),
    sale_price DECIMAL(10, 2),
    observations TEXT,
    capacity TEXT,
    manufacturer TEXT,
    last_inspection_date TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inspections table
CREATE TABLE IF NOT EXISTS inspections (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    inspected_items JSONB NOT NULL,
    date TEXT NOT NULL,
    inspector TEXT,
    observations TEXT,
    client_signature TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    inspection_id TEXT REFERENCES inspections(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    issue_date TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial records table
CREATE TABLE IF NOT EXISTS financial (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    inspection_id TEXT,
    description TEXT,
    value DECIMAL(10, 2) NOT NULL,
    issue_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    payment_date TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    description TEXT,
    delivery_date TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    supplier TEXT,
    value DECIMAL(10, 2) NOT NULL,
    due_date TEXT NOT NULL,
    payment_date TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Company profile table
CREATE TABLE IF NOT EXISTS company_profile (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- App settings table
CREATE TABLE IF NOT EXISTS app_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    reminders BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
