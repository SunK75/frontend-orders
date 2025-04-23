import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";

function Invoices() {
  const [tab, setTab] = useState("sale");
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [saleInvoices, setSaleInvoices] = useState([]);
  const [expenseInvoices, setExpenseInvoices] = useState([]);
  const [saleForm, setSaleForm] = useState({ customer_id: "", invoice_number: "", amount: "", description: "", due_date: "" });
  const [expenseForm, setExpenseForm] = useState({ vendor_id: "", invoice_number: "", amount: "", description: "", due_date: "" });
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get(`${BASE_URL}/customers`).then(res => setCustomers(res.data));
    axios.get(`${BASE_URL}/vendors`).then(res => setVendors(res.data));
    axios.get(`${BASE_URL}/invoices/sales`).then(res => setSaleInvoices(res.data));
    axios.get(`${BASE_URL}/invoices/expenses`).then(res => setExpenseInvoices(res.data));
  }, []);

  const handleSaleChange = (e) => setSaleForm({ ...saleForm, [e.target.name]: e.target.value });
  const handleExpenseChange = (e) => setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });

  const handleSaleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...saleForm, customer_id: parseInt(saleForm.customer_id), amount: parseFloat(saleForm.amount) };
    axios.post(`${BASE_URL}/invoices/sales`, payload)
      .then(() => {
        setMessage("✅ Sale invoice added!");
        setSaleForm({ customer_id: "", invoice_number: "", amount: "", description: "", due_date: "" });
        setShowForm(false);
        axios.get(`${BASE_URL}/invoices/sales`).then(res => setSaleInvoices(res.data));
      })
      .catch(() => setMessage("❌ Error adding sale invoice"));
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    const payload = { ...expenseForm, vendor_id: parseInt(expenseForm.vendor_id), amount: parseFloat(expenseForm.amount) };
    axios.post(`${BASE_URL}/invoices/expenses`, payload)
      .then(() => {
        setMessage("✅ Expense invoice added!");
        setExpenseForm({ vendor_id: "", invoice_number: "", amount: "", description: "", due_date: "" });
        setShowForm(false);
        axios.get(`${BASE_URL}/invoices/expenses`).then(res => setExpenseInvoices(res.data));
      })
      .catch(() => setMessage("❌ Error adding expense invoice"));
  };

  const getName = (id, type) => {
    const list = type === "customer" ? customers : vendors;
    return list.find((x) => x.id === id)?.name || "";
  };

  const filteredInvoices = (list, type) => {
    return list.filter(inv => {
      const name = getName(type === "sale" ? inv.customer_id : inv.vendor_id, type === "sale" ? "customer" : "vendor");
      return name.toLowerCase().includes(search.toLowerCase()) || inv.invoice_number.includes(search);
    });
  };

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4 text-primary">📑 Invoices</h2>

      <div className="btn-group mb-4">
        <button className={`btn btn-${tab === "sale" ? "primary" : "outline-primary"}`} onClick={() => setTab("sale")}>Sale Invoices</button>
        <button className={`btn btn-${tab === "expense" ? "primary" : "outline-primary"}`} onClick={() => setTab("expense")}>Expense Invoices</button>
      </div>

      <div className="d-flex justify-content-between mb-3">
        <input type="text" className="form-control w-50" placeholder="Search by name or invoice #" value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-success ms-3" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close Form" : tab === "sale" ? "➕ Add Sale Invoice" : "➕ Add Expense Invoice"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={tab === "sale" ? handleSaleSubmit : handleExpenseSubmit} className="row g-3 mb-4 bg-light p-4 rounded shadow-sm">
          <div className="col-md-6">
            <label className="form-label">{tab === "sale" ? "Customer" : "Vendor"}</label>
            <select name={tab === "sale" ? "customer_id" : "vendor_id"} value={tab === "sale" ? saleForm.customer_id : expenseForm.vendor_id} onChange={tab === "sale" ? handleSaleChange : handleExpenseChange} required className="form-select">
              <option value="">Select</option>
              {(tab === "sale" ? customers : vendors).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Invoice #</label>
            <input type="text" name="invoice_number" value={tab === "sale" ? saleForm.invoice_number : expenseForm.invoice_number} onChange={tab === "sale" ? handleSaleChange : handleExpenseChange} className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Amount</label>
            <input type="number" name="amount" value={tab === "sale" ? saleForm.amount : expenseForm.amount} onChange={tab === "sale" ? handleSaleChange : handleExpenseChange} className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Due Date</label>
            <input type="date" name="due_date" value={tab === "sale" ? saleForm.due_date : expenseForm.due_date} onChange={tab === "sale" ? handleSaleChange : handleExpenseChange} className="form-control" />
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <input type="text" name="description" value={tab === "sale" ? saleForm.description : expenseForm.description} onChange={tab === "sale" ? handleSaleChange : handleExpenseChange} className="form-control" />
          </div>
          <div className="col-12">
            <button type="submit" className={`btn btn-${tab === "sale" ? "primary" : "success"} w-100`}>
              Add {tab === "sale" ? "Sale" : "Expense"} Invoice
            </button>
          </div>
        </form>
      )}

      <h4 className="text-secondary">{tab === "sale" ? "🧾 Sale Invoice List" : "📦 Expense Invoice List"}</h4>
      <table className="table table-bordered mt-3">
        <thead className="table-light">
          <tr>
            <th>{tab === "sale" ? "Customer" : "Vendor"}</th>
            <th>Invoice #</th>
            <th>Amount</th>
            <th>Due Date</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices(tab === "sale" ? saleInvoices : expenseInvoices, tab).map(inv => (
            <tr key={inv.id}>
              <td>{getName(tab === "sale" ? inv.customer_id : inv.vendor_id, tab === "sale" ? "customer" : "vendor")}</td>
              <td>{inv.invoice_number}</td>
              <td>₹{inv.amount}</td>
              <td>{inv.due_date}</td>
              <td>{inv.description}</td>
            </tr>
          ))}
          {filteredInvoices(tab === "sale" ? saleInvoices : expenseInvoices, tab).length === 0 && (
            <tr><td colSpan="5" className="text-center text-muted">No invoices found</td></tr>
          )}
        </tbody>
      </table>

      {message && <div className="alert alert-info mt-4">{message}</div>}
    </div>
  );
}

export default Invoices;