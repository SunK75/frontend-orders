import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [customerPayments, setCustomerPayments] = useState({});
  const [vendorPayments, setVendorPayments] = useState({});
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("${BASE_URL}/orders");
      const fetchedOrders = res.data; // Keep backend DESC order
      setOrders(fetchedOrders);
      for (const order of fetchedOrders) {
        fetchPayments(order.id);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  const fetchPayments = async (orderId) => {
    try {
      const res = await axios.get(`${BASE_URL}/payments/by-order/${orderId}`);
      const cust = res.data.filter(p => p.type === "customer");
      const vend = res.data.filter(p => p.type === "vendor");
      setCustomerPayments(prev => ({ ...prev, [orderId]: cust }));
      setVendorPayments(prev => ({ ...prev, [orderId]: vend }));
    } catch (err) {
      console.error("Failed to fetch payments", err);
    }
  };

  const handleEditRedirect = (order) => {
    navigate(`/orders/edit/${order.id}`);
  };

  const filteredOrders = orders.filter(o =>
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.transporter_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.from_location?.toLowerCase().includes(search.toLowerCase()) ||
    o.to_location?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const displayedOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

  return (
    <div className="container-fluid px-4 my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">🚚 Orders</h2>
        <Link to="/orders/new" className="btn btn-success">➕ Add New Order</Link>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="🔍 Search by customer, transporter or route"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="ms-3">
          <label className="me-2">Show:</label>
          <select className="form-select d-inline w-auto"
            value={ordersPerPage}
            onChange={(e) => {
              setOrdersPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}>
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Route</th>
              <th>Customer</th>
              <th>Cust Rate</th>
              <th>Cust Payment</th>
              <th>Transporter</th>
              <th>Vend Rate</th>
              <th>Vend Payment</th>
              <th>POD</th>
              <th>Docs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedOrders.map(order => {
              const custExtras = order.customer_expenses?.split(",").map(e => e.trim()) || [];
              const vendExtras = order.transporter_expenses?.split(",").map(e => e.trim()) || [];
              const custTotal = order.customer_rate + custExtras.reduce((sum, e) => sum + parseFloat(e.split(": ")[1] || 0), 0);
              const vendTotal = order.transporter_rate + vendExtras.reduce((sum, e) => sum + parseFloat(e.split(": ")[1] || 0), 0);
              return (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{formatDate(order.date)}</td>
                  <td>{order.vehicle_number}<br /><i>{order.driver_name} ({order.driver_contact})</i></td>
                  <td>{order.from_location} → {order.to_location}</td>
                  <td>{order.customer_name}</td>
                  <td>
                    <strong>Total:</strong> ₹{custTotal}<br />
                    <small>Freight: ₹{order.customer_rate}</small><br />
                    {custExtras.map((e, i) => <div key={i}><small>{e}</small></div>)}
                  </td>
                  <td>{(customerPayments[order.id] || []).map((p, i) => (<div key={i}><small>{formatDate(p.date)} - ₹{p.amount}</small></div>))}</td>
                  <td>{order.transporter_name}</td>
                  <td>
                    <strong>Total:</strong> ₹{vendTotal}<br />
                    <small>Freight: ₹{order.transporter_rate}</small><br />
                    {vendExtras.map((e, i) => <div key={i}><small>{e}</small></div>)}
                  </td>
                  <td>{(vendorPayments[order.id] || []).map((p, i) => (<div key={i}><small>{formatDate(p.date)} - ₹{p.amount}</small></div>))}</td>
                  <td>
                    <select className="form-select form-select-sm">
                      <option>Pending</option>
                      <option>In-transit</option>
                      <option>Received</option>
                      <option>Couriered</option>
                    </select>
                  </td>
                  <td><Link to={`/orders/${order.id}/docs`}>📁 Docs</Link></td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handleEditRedirect(order)}>Edit</button>
                  </td>
                </tr>
              );
            })}
            {displayedOrders.length === 0 && (
              <tr><td colSpan="13" className="text-center text-muted">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm mx-1 ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
