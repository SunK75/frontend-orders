import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";

function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/dashboard/summary`).then((res) => setSummary(res.data));
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary fw-bold">📊 Broker Dashboard</h2>

      {summary && (
        <div className="row g-4">
          <Card title="Total Sales" value={summary.total_sales} color="success" />
          <Card title="Total Expenses" value={summary.total_expenses} color="danger" />
          <Card title="Payments Received" value={summary.payments_received} color="info" />
          <Card title="Payments Made" value={summary.payments_made} color="secondary" />
          <Card title="Receivables" value={summary.receivables} color="warning" />
          <Card title="Payables" value={summary.payables} color="dark" />
          <div className="col-12">
            <div className="card text-white bg-primary shadow">
              <div className="card-body">
                <h5 className="card-title">💼 Net Cash Flow</h5>
                <p className="display-6">₹{summary.cash_flow}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className="col-md-4">
      <div className={`card border-${color} shadow`}>
        <div className="card-body">
          <h6 className={`text-${color} text-uppercase`}>{title}</h6>
          <h4 className={`fw-bold text-${color}`}>₹{value}</h4>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;