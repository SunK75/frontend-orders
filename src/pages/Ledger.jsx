import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { BASE_URL } from "../config";

function Ledger() {
  const [type, setType] = useState("customer");
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [ledgerData, setLedgerData] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    axios.get(`${BASE_URL}/customers/`).then(res => setCustomers(res.data));
    axios.get(`${BASE_URL}/vendors/`).then(res => setVendors(res.data));
  }, []);

  const handleSelect = (id) => {
    setSelectedId(id);
    const url = type === "customer" ? `customer/${id}` : `vendor/${id}`;
    axios.get(`${BASE_URL}/ledger/${url}`)
      .then(res => {
        setLedgerData(res.data);
        setMessage("");
      })
      .catch(() => setMessage(`❌ Error loading ${type} ledger`));
  };

  const getFilteredList = () => {
    const list = type === "customer" ? customers : vendors;
    return list.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));
  };

  const filterByDateRange = (entries) => {
    const from = dateRange.from ? new Date(dateRange.from) : null;
    const to = dateRange.to ? new Date(dateRange.to) : null;
    return entries.filter(entry => {
      const date = new Date(entry.date);
      return (!from || date >= from) && (!to || date <= to);
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Ledger for ${ledgerData.customer || ledgerData.vendor}`, 10, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Date", "Type", "Description", "Debit", "Credit", "Balance"]],
      body: filterByDateRange(ledgerData.ledger).map(entry => [
        entry.date, entry.type, entry.description, entry.debit || "-", entry.credit || "-", entry.balance
      ])
    });
    doc.save("ledger.pdf");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filterByDateRange(ledgerData.ledger));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ledger");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), "ledger.xlsx");
  };

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4 text-primary">📒 Ledger View</h2>

      <div className="btn-group mb-4">
        <button className={`btn btn-${type === "customer" ? "primary" : "outline-primary"}`} onClick={() => {
          setType("customer"); setSelectedId(""); setLedgerData(null);
        }}>Customer</button>
        <button className={`btn btn-${type === "vendor" ? "primary" : "outline-primary"}`} onClick={() => {
          setType("vendor"); setSelectedId(""); setLedgerData(null);
        }}>Vendor</button>
      </div>

      <div className="mb-3">
        <input type="text" className="form-control mb-2" placeholder={`Search or Select ${type}`} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="form-select" value={selectedId} onChange={(e) => handleSelect(e.target.value)}>
          <option value="">-- Select from filtered list --</option>
          {getFilteredList().map(item => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      {ledgerData && (
        <div className="bg-light p-4 rounded shadow-sm">
          <h4 className="mb-4 text-secondary">
            Ledger for <strong>{ledgerData.customer || ledgerData.vendor}</strong>
          </h4>

          <div className="row mb-3">
            <div className="col">
              <label className="form-label">From</label>
              <input type="date" className="form-control" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
            </div>
            <div className="col">
              <label className="form-label">To</label>
              <input type="date" className="form-control" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
            </div>
          </div>

          <div className="mb-3">
            <button onClick={exportPDF} className="btn btn-outline-danger me-2">Export PDF</button>
            <button onClick={exportExcel} className="btn btn-outline-success">Export Excel</button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {filterByDateRange(ledgerData.ledger).map((entry, i) => (
                  <tr key={i}>
                    <td>{entry.date}</td>
                    <td>{entry.type}</td>
                    <td>{entry.description}</td>
                    <td>{entry.debit || "-"}</td>
                    <td>{entry.credit || "-"}</td>
                    <td>{entry.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-end fw-bold mt-3">
            Closing Balance: ₹{ledgerData.closing_balance}
          </div>
        </div>
      )}

      {message && <div className="alert alert-warning mt-4">{message}</div>}
    </div>
  );
}

export default Ledger;

