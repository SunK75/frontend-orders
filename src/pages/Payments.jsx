import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./config";

function Payments() {
  const [tab, setTab] = useState("received");
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [receivedPayments, setReceivedPayments] = useState([]);
  const [madePayments, setMadePayments] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [received, setReceived] = useState({ customer_id: "", amount: "", received_date: "", method: "", invoice_id: "" });
  const [made, setMade] = useState({ vendor_id: "", amount: "", payment_date: "", method: "", invoice_id: "" });

  useEffect(() => {
    axios.get("${BASE_URL}/customers").then(res => setCustomers(res.data));
    axios.get("${BASE_URL}/vendors").then(res => setVendors(res.data));
    axios.get("${BASE_URL}/payments/received").then(res => setReceivedPayments(res.data));
    axios.get("${BASE_URL}/payments/made").then(res => setMadePayments(res.data));
  }, []);

  const handleChange = (e, type) => {
    type === "received"
      ? setReceived({ ...received, [e.target.name]: e.target.value })
      : setMade({ ...made, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    const payload = type === "received" ? {
      ...received,
      customer_id: parseInt(received.customer_id),
      amount: parseFloat(received.amount),
      invoice_id: received.invoice_id ? parseInt(received.invoice_id) : null,
    } : {
      ...made,
      vendor_id: parseInt(made.vendor_id),
      amount: parseFloat(made.amount),
      invoice_id: made.invoice_id ? parseInt(made.invoice_id) : null,
    };

    try {
      await axios.post(`${BASE_URL}/payments/${type}`, payload);
      setMessage(type === "received" ? "✅ Payment received recorded" : "✅ Payment made recorded");
      type === "received"
        ? setReceived({ customer_id: "", amount: "", received_date: "", method: "", invoice_id: "" })
        : setMade({ vendor_id: "", amount: "", payment_date: "", method: "", invoice_id: "" });
      axios.get(`${BASE_URL}/payments/${type}`).then(res => type === "received" ? setReceivedPayments(res.data) : setMadePayments(res.data));
      setShowForm(false);
    } catch {
      setMessage(`❌ Error recording ${type} payment`);
    }
  };

  const getName = (id, type) => {
    const list = type === "customer" ? customers : vendors;
    return list.find(x => x.id === id)?.name || "";
  };

  const filtered = (tab === "received" ? receivedPayments : madePayments).filter(p => {
    const name = getName(tab === "received" ? p.customer_id : p.vendor_id, tab === "received" ? "customer" : "vendor");
    return name.toLowerCase().includes(search.toLowerCase()) || p.method.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4 text-primary">💸 Payments</h2>

      <div className="btn-group mb-4">
        <button className={`btn btn-${tab === "received" ? "primary" : "outline-primary"}`} onClick={() => setTab("received")}>Payments Received</button>
        <button className={`btn btn-${tab === "made" ? "primary" : "outline-primary"}`} onClick={() => setTab("made")}>Payments Made</button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          placeholder="Search by name or method"
          className="form-control w-50"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-success ms-3" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : `➕ Add Payment`}
        </button>
      </div>

      {showForm && (
        <form onSubmit={e => handleSubmit(e, tab)} className="row g-3 bg-light p-4 mb-4 rounded shadow-sm">
          <div className="col-md-6">
            <label className="form-label">{tab === "received" ? "Customer" : "Vendor"}</label>
            <select
              name={tab === "received" ? "customer_id" : "vendor_id"}
              value={tab === "received" ? received.customer_id : made.vendor_id}
              onChange={e => handleChange(e, tab)}
              className="form-select" required
            >
              <option value="">Select</option>
              {(tab === "received" ? customers : vendors).map(x => (
                <option key={x.id} value={x.id}>{x.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Amount</label>
            <input type="number" name="amount" onChange={e => handleChange(e, tab)} value={tab === "received" ? received.amount : made.amount} className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Date</label>
            <input type="date" name={tab === "received" ? "received_date" : "payment_date"} onChange={e => handleChange(e, tab)} value={tab === "received" ? received.received_date : made.payment_date} className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Method</label>
            <input type="text" name="method" onChange={e => handleChange(e, tab)} value={tab === "received" ? received.method : made.method} className="form-control" />
          </div>
          <div className="col-12">
            <label className="form-label">Invoice ID (optional)</label>
            <input type="number" name="invoice_id" onChange={e => handleChange(e, tab)} value={tab === "received" ? received.invoice_id : made.invoice_id} className="form-control" />
          </div>
          <div className="col-12">
            <button className={`btn btn-${tab === "received" ? "primary" : "success"} w-100`}>Save Payment</button>
          </div>
        </form>
      )}

      <h4 className="text-secondary">📜 {tab === "received" ? "Payments Received" : "Payments Made"}</h4>
      <table className="table table-bordered mt-3">
        <thead className="table-light">
          <tr>
            <th>{tab === "received" ? "Customer" : "Vendor"}</th>
            <th>Amount</th>
            <th>{tab === "received" ? "Received Date" : "Payment Date"}</th>
            <th>Method</th>
            <th>Invoice ID</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <tr key={i}>
              <td>{getName(tab === "received" ? p.customer_id : p.vendor_id, tab === "received" ? "customer" : "vendor")}</td>
              <td>₹{p.amount}</td>
              <td>{tab === "received" ? p.received_date : p.payment_date}</td>
              <td>{p.method}</td>
              <td>{p.invoice_id || "-"}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan="5" className="text-center text-muted">No payments found</td></tr>
          )}
        </tbody>
      </table>

      {message && <div className="alert alert-info mt-4">{message}</div>}
    </div>
  );
}

export default Payments;
