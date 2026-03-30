import { Client, Equipment, Inspection, FinancialRecord, Certificate, Expense } from "../../types";

const API_BASE = "/api";

export const api = {
  async initDb() {
    const res = await fetch(`${API_BASE}/init-db`, { method: "POST" });
    return res.json();
  },

  // Clients
  async getClients(): Promise<Client[]> {
    const res = await fetch(`${API_BASE}/clients`);
    const data = await res.json();
    return data.map((c: any) => ({
      ...c,
      contactName: c.contact_name,
      isRecurring: c.is_recurring,
      recurringAmount: c.recurring_amount ? Number(c.recurring_amount) : undefined,
      recurringInstallments: c.recurring_installments,
      recurringCycleStart: c.recurring_cycle_start,
      paidInstallments: c.paid_installments,
    }));
  },
  async saveClient(client: Client) {
    const dbClient = {
      id: client.id,
      name: client.name,
      document: client.document,
      address: client.address,
      city: client.city,
      contact_name: client.contactName,
      contact: client.contact,
      email: client.email,
      is_recurring: client.isRecurring,
      recurring_amount: client.recurringAmount,
      recurring_installments: client.recurringInstallments,
      recurring_cycle_start: client.recurringCycleStart,
      paid_installments: client.paidInstallments,
    };
    const res = await fetch(`${API_BASE}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dbClient),
    });
    return res.json();
  },
  async deleteClient(id: string) {
    const res = await fetch(`${API_BASE}/clients/${id}`, { method: "DELETE" });
    return res.json();
  },

  // Equipment
  async getEquipment(): Promise<Equipment[]> {
    const res = await fetch(`${API_BASE}/equipment`);
    const data = await res.json();
    return data.map((e: any) => ({
      ...e,
      clientId: e.client_id,
      serialNumber: e.serial_number,
      expiryDate: e.expiry_date,
      unitOfMeasure: e.unit_of_measure,
      costPrice: e.cost_price ? Number(e.cost_price) : undefined,
      salePrice: e.sale_price ? Number(e.sale_price) : undefined,
      lastInspectionDate: e.last_inspection_date,
    }));
  },
  async saveEquipment(eq: Equipment) {
    const dbEq = {
      id: eq.id,
      client_id: eq.clientId,
      name: eq.name,
      serial_number: eq.serialNumber,
      expiry_date: eq.expiryDate,
      category: eq.category,
      unit_of_measure: eq.unitOfMeasure,
      cost_price: eq.costPrice,
      sale_price: eq.salePrice,
      observations: eq.observations,
      capacity: eq.capacity,
      manufacturer: eq.manufacturer,
      last_inspection_date: eq.lastInspectionDate,
      status: eq.status,
    };
    const res = await fetch(`${API_BASE}/equipment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dbEq),
    });
    return res.json();
  },
  async deleteEquipment(id: string) {
    const res = await fetch(`${API_BASE}/equipment/${id}`, { method: "DELETE" });
    return res.json();
  },

  // Inspections
  async getInspections(): Promise<Inspection[]> {
    const res = await fetch(`${API_BASE}/inspections`);
    const data = await res.json();
    return data.map((i: any) => ({
      ...i,
      clientId: i.client_id,
      inspectedItems: i.inspected_items,
      clientSignature: i.client_signature,
    }));
  },
  async saveInspection(insp: Inspection) {
    const dbInsp = {
      id: insp.id,
      client_id: insp.clientId,
      inspected_items: insp.inspectedItems,
      date: insp.date,
      inspector: insp.inspector,
      observations: insp.observations,
      client_signature: insp.clientSignature,
      status: insp.status,
    };
    const res = await fetch(`${API_BASE}/inspections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dbInsp),
    });
    return res.json();
  },

  // Financial Records
  async getFinancialRecords(): Promise<FinancialRecord[]> {
    const res = await fetch(`${API_BASE}/financial_records`);
    const data = await res.json();
    return data.map((f: any) => ({
      ...f,
      clientId: f.client_id,
      inspectionId: f.inspection_id,
      value: Number(f.value),
      issueDate: f.issue_date,
      dueDate: f.due_date,
      paymentDate: f.payment_date,
    }));
  },
  async saveFinancialRecord(rec: FinancialRecord) {
    const dbRec = {
      id: rec.id,
      client_id: rec.clientId,
      inspection_id: rec.inspectionId,
      description: rec.description,
      value: rec.value,
      issue_date: rec.issueDate,
      due_date: rec.dueDate,
      payment_date: rec.paymentDate,
      status: rec.status,
    };
    const res = await fetch(`${API_BASE}/financial_records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dbRec),
    });
    return res.json();
  },
  async deleteFinancialRecord(id: string) {
    const res = await fetch(`${API_BASE}/financial_records/${id}`, { method: "DELETE" });
    return res.json();
  },

  // Certificates
  async getCertificates(): Promise<Certificate[]> {
    const res = await fetch(`${API_BASE}/certificates`);
    const data = await res.json();
    return data.map((c: any) => ({
      ...c,
      inspectionId: c.inspection_id,
      clientId: c.client_id,
      issueDate: c.issue_date,
      expiryDate: c.expiry_date,
    }));
  },
  async saveCertificate(cert: Certificate) {
    const dbCert = {
      id: cert.id,
      inspection_id: cert.inspectionId,
      client_id: cert.clientId,
      issue_date: cert.issueDate,
      expiry_date: cert.expiryDate,
    };
    const res = await fetch(`${API_BASE}/certificates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dbCert),
    });
    return res.json();
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    const res = await fetch(`${API_BASE}/expenses`);
    const data = await res.json();
    return data.map((e: any) => ({
      ...e,
      value: Number(e.value),
      dueDate: e.due_date,
      paymentDate: e.payment_date,
    }));
  },
  async saveExpense(exp: Expense) {
    const dbExp = {
      id: exp.id,
      description: exp.description,
      supplier: exp.supplier,
      value: exp.value,
      due_date: exp.dueDate,
      payment_date: exp.paymentDate,
      status: exp.status,
    };
    const res = await fetch(`${API_BASE}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dbExp),
    });
    return res.json();
  },
  async deleteExpense(id: string) {
    const res = await fetch(`${API_BASE}/expenses/${id}`, { method: "DELETE" });
    return res.json();
  },
};
