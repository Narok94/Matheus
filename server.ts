import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query, initDB } from "./src/db/index";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
let isDbInitialized = false;
const ensureDb = async (req: any, res: any, next: any) => {
  if (!isDbInitialized) {
    try {
      await initDB();
      isDbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize DB in middleware:', error);
    }
  }
  next();
};

app.use(ensureDb);

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post("/api/auth/register", async (req, res) => {
  const { username, passwordHash, email, fullName } = req.body;
  try {
    // Check if user exists
    const userExists = await query("SELECT * FROM users WHERE username = $1", [username.toLowerCase()]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash the password hash (sha256 from frontend) again with bcrypt
    const salt = await bcrypt.genSalt(10);
    const bcryptHash = await bcrypt.hash(passwordHash, salt);

    const result = await query(
      "INSERT INTO users (username, password_hash, email, full_name) VALUES ($1, $2, $3, $4) RETURNING id, username",
      [username.toLowerCase(), bcryptHash, email, fullName]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, passwordHash } = req.body;
  try {
    const result = await query("SELECT * FROM users WHERE username = $1", [username.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(passwordHash, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, fullName: user.full_name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- DATA SYNC ROUTES ---
app.get("/api/sync", authenticateToken, async (req: any, res) => {
  const userId = req.user.id;
  try {
    const clients = await query("SELECT * FROM clients WHERE user_id = $1", [userId]);
    const equipment = await query("SELECT * FROM equipment WHERE user_id = $1", [userId]);
    const inspections = await query("SELECT * FROM inspections WHERE user_id = $1", [userId]);
    const financial = await query("SELECT * FROM financial WHERE user_id = $1", [userId]);
    const certificates = await query("SELECT * FROM certificates WHERE user_id = $1", [userId]);
    const licenses = await query("SELECT * FROM licenses WHERE user_id = $1", [userId]);
    const deliveries = await query("SELECT * FROM deliveries WHERE user_id = $1", [userId]);
    const expenses = await query("SELECT * FROM expenses WHERE user_id = $1", [userId]);
    const profile = await query("SELECT * FROM company_profile WHERE user_id = $1", [userId]);
    const settings = await query("SELECT * FROM app_settings WHERE user_id = $1", [userId]);

    res.json({
      clients: clients.rows,
      equipment: equipment.rows,
      inspections: inspections.rows,
      financial: financial.rows,
      certificates: certificates.rows,
      licenses: licenses.rows,
      deliveries: deliveries.rows,
      expenses: expenses.rows,
      companyProfile: profile.rows[0] || { name: "InspecPro", logo: "" },
      appSettings: settings.rows[0] || { reminders: true }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/sync", authenticateToken, async (req: any, res) => {
  const userId = req.user.id;
  const { clients, equipment, inspections, financial, certificates, licenses, deliveries, expenses, companyProfile, appSettings } = req.body;

  try {
    await query("BEGIN");

    // Clear existing data for user (or implement a more sophisticated merge)
    await query("DELETE FROM equipment WHERE user_id = $1", [userId]);
    await query("DELETE FROM inspections WHERE user_id = $1", [userId]);
    await query("DELETE FROM financial WHERE user_id = $1", [userId]);
    await query("DELETE FROM certificates WHERE user_id = $1", [userId]);
    await query("DELETE FROM licenses WHERE user_id = $1", [userId]);
    await query("DELETE FROM deliveries WHERE user_id = $1", [userId]);
    await query("DELETE FROM expenses WHERE user_id = $1", [userId]);
    await query("DELETE FROM clients WHERE user_id = $1", [userId]);

    // Insert Clients
    for (const c of clients) {
      await query(
        "INSERT INTO clients (id, user_id, name, document, address, city, contact_name, contact, email, is_recurring, recurring_amount, recurring_installments, recurring_cycle_start, paid_installments) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)",
        [c.id, userId, c.name, c.document, c.address, c.city, c.contactName, c.contact, c.email, c.isRecurring, c.recurringAmount, c.recurringInstallments, c.recurringCycleStart, c.paidInstallments]
      );
    }

    // Insert Equipment
    for (const e of equipment) {
      await query(
        "INSERT INTO equipment (id, user_id, client_id, name, serial_number, expiry_date, category, unit_of_measure, cost_price, sale_price, observations, capacity, manufacturer, last_inspection_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)",
        [e.id, userId, e.clientId, e.name, e.serialNumber, e.expiryDate, e.category, e.unitOfMeasure, e.costPrice, e.salePrice, e.observations, e.capacity, e.manufacturer, e.lastInspectionDate, e.status]
      );
    }

    // Insert Inspections
    for (const i of inspections) {
      await query(
        "INSERT INTO inspections (id, user_id, client_id, inspected_items, date, inspector, observations, client_signature, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [i.id, userId, i.clientId, JSON.stringify(i.inspectedItems), i.date, i.inspector, i.observations, i.clientSignature, i.status]
      );
    }

    // Insert Certificates
    for (const cert of certificates) {
      await query(
        "INSERT INTO certificates (id, user_id, inspection_id, client_id, issue_date, expiry_date) VALUES ($1, $2, $3, $4, $5, $6)",
        [cert.id, userId, cert.inspectionId, cert.clientId, cert.issueDate, cert.expiryDate]
      );
    }

    // Insert Financial
    for (const f of financial) {
      await query(
        "INSERT INTO financial (id, user_id, client_id, inspection_id, description, value, issue_date, due_date, payment_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
        [f.id, userId, f.clientId, f.inspectionId, f.description, f.value, f.issueDate, f.due_date || f.dueDate, f.payment_date || f.paymentDate, f.status]
      );
    }

    // Insert Licenses
    for (const l of licenses) {
      await query(
        "INSERT INTO licenses (id, user_id, client_id, type, issue_date, expiry_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [l.id, userId, l.clientId, l.type, l.issueDate, l.expiryDate, l.status]
      );
    }

    // Insert Deliveries
    for (const d of deliveries) {
      await query(
        "INSERT INTO deliveries (id, user_id, client_id, description, delivery_date, status) VALUES ($1, $2, $3, $4, $5, $6)",
        [d.id, userId, d.clientId, d.description, d.deliveryDate, d.status]
      );
    }

    // Insert Expenses
    for (const ex of expenses) {
      await query(
        "INSERT INTO expenses (id, user_id, description, supplier, value, due_date, payment_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [ex.id, userId, ex.description, ex.supplier, ex.value, ex.due_date || ex.dueDate, ex.payment_date || ex.paymentDate, ex.status]
      );
    }

    // Update Company Profile
    await query(
      "INSERT INTO company_profile (user_id, name, logo) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name, logo = EXCLUDED.logo, updated_at = CURRENT_TIMESTAMP",
      [userId, companyProfile.name, companyProfile.logo]
    );

    // Update App Settings
    await query(
      "INSERT INTO app_settings (user_id, reminders) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET reminders = EXCLUDED.reminders, updated_at = CURRENT_TIMESTAMP",
      [userId, appSettings.reminders]
    );

    await query("COMMIT");
    res.json({ success: true });
  } catch (error) {
    await query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server locally
if (process.env.NODE_ENV !== "production") {
  start();
}

export default app;
