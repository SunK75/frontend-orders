import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../config";

function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const vehicleTypeOptions = ["Closed Container", "Open Body", "Trailer"];
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const [customerExpenses, setCustomerExpenses] = useState([]);
  const [transporterExpenses, setTransporterExpenses] = useState([]);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [vendorPayments, setVendorPayments] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [orderRes, customersRes, vendorsRes, paymentsRes, docsRes] = await Promise.all([
          axios.get(`${BASE_URL}/orders/${id}`),
          axios.get(`${BASE_URL}/customers`),
          axios.get(`${BASE_URL}/vendors`),
          axios.get(`${BASE_URL}/payments/by-order/${id}`),
          axios.get(`${BASE_URL}/orders/${id}/documents`).catch(() => ({ data: [] }))
        ]);

        const order = orderRes.data;
        setOrder(order);
        setCustomers(customersRes.data);
        setVendors(vendorsRes.data);
        setUploadedDocs(docsRes.data);

        setCustomerExpenses(order.customer_expenses?.split(", ").filter(Boolean) || []);
        setTransporterExpenses(order.transporter_expenses?.split(", ").filter(Boolean) || []);

        setCustomerPayments(paymentsRes.data.filter(p => p.type === "customer"));
        setVendorPayments(paymentsRes.data.filter(p => p.type === "vendor"));

        setLoading(false);
      } catch (err) {
        console.error("Error fetching order data:", err);
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleChange = (field, value) => {
    setOrder(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCharge = (setFn) => {
    setFn(prev => [...prev, ""]);
  };

  const handleChangeCharge = (setFn, index, value) => {
    setFn(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddPayment = (setFn) => {
    setFn(prev => [...prev, { id: null, date: "", amount: "" }]);
  };

  const handleChangePayment = (setFn, index, field, value) => {
    setFn(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const uploadDocuments = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append("files", file));

    try {
      const res = await axios.post(
        `${BASE_URL}/orders/${id}/documents`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setUploadedDocs(prev => [...prev, ...res.data]);
    } catch (err) {
      console.error("Failed to upload documents", err);
    }
  };

  const savePayments = async () => {
    try {
      const allPayments = [
        ...customerPayments.map(p => ({ ...p, type: "customer", order_id: parseInt(id) })),
        ...vendorPayments.map(p => ({ ...p, type: "vendor", order_id: parseInt(id) }))
      ];

      await axios.post(`${BASE_URL}/orders/${id}/payments`, allPayments);
    } catch (err) {
      console.error("Failed to save payments", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        vehicle_number: order.vehicle_number,
        driver_name: order.driver_name,
        driver_contact: order.driver_contact,
        from_location: order.from_location,
        to_location: order.to_location,
        vehicle_type: order.vehicle_type,
        customer_expenses: customerExpenses.join(", "),
        transporter_expenses: transporterExpenses.join(", ")
      };
      await axios.patch(`${BASE_URL}/orders/${id}`, updateData);
      await savePayments();
      navigate("/orders");
    } catch (err) {
      console.error("Failed to save order:", err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!order) return <div className="p-4 text-danger">Order not found</div>;

  return (
    <div className="container my-5">
      <h2 className="fw-bold text-primary mb-4">📝 Edit Order #{id}</h2>
      <form className="card p-4" onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Order Number</label>
            <input className="form-control" value={order.order_number || ""} disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label">Order Date</label>
            <input type="date" className="form-control" value={order.date || ""} disabled />
          </div>
        </div>

        <hr className="my-4" />

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Customer</label>
            <input className="form-control" value={order.customer_name || ""} disabled />
            <label className="form-label mt-2">Customer Rate</label>
            <input className="form-control" value={order.customer_rate || ""} disabled />
            <label className="form-label mt-2">Customer Charges</label>
            {customerExpenses.map((c, i) => (
              <input key={i} className="form-control mb-1" value={c} onChange={e => handleChangeCharge(setCustomerExpenses, i, e.target.value)} />
            ))}
            <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => handleAddCharge(setCustomerExpenses)}>➕ Add Charge</button>
          </div>
          <div className="col-md-6">
            <label className="form-label">Transporter</label>
            <input className="form-control" value={order.transporter_name || ""} disabled />
            <label className="form-label mt-2">Transporter Rate</label>
            <input className="form-control" value={order.transporter_rate || ""} disabled />
            <label className="form-label mt-2">Transporter Charges</label>
            {transporterExpenses.map((c, i) => (
              <input key={i} className="form-control mb-1" value={c} onChange={e => handleChangeCharge(setTransporterExpenses, i, e.target.value)} />
            ))}
            <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => handleAddCharge(setTransporterExpenses)}>➕ Add Charge</button>
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <label className="form-label">From Location</label>
            <input className="form-control" value={order.from_location || ""} onChange={e => handleChange("from_location", e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label">To Location</label>
            <input className="form-control" value={order.to_location || ""} onChange={e => handleChange("to_location", e.target.value)} />
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <label className="form-label">Vehicle Number</label>
            <input className="form-control" value={order.vehicle_number || ""} onChange={e => handleChange("vehicle_number", e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Driver Name</label>
            <input className="form-control" value={order.driver_name || ""} onChange={e => handleChange("driver_name", e.target.value)} />
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <label className="form-label">Driver Contact</label>
            <input className="form-control" value={order.driver_contact || ""} onChange={e => handleChange("driver_contact", e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Vehicle Type</label>
            <select className="form-select" value={order.vehicle_type || ""} onChange={e => handleChange("vehicle_type", e.target.value)}>
              <option value="">Select Vehicle Type</option>
              {vehicleTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="my-4" />
        <label className="form-label">Customer Payments</label>
        {customerPayments.map((p, i) => (
          <div className="row g-2 mb-2" key={i}>
            <div className="col-md-6">
              <input type="date" className="form-control" value={p.date} onChange={e => handleChangePayment(setCustomerPayments, i, "date", e.target.value)} />
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="Amount" value={p.amount} onChange={e => handleChangePayment(setCustomerPayments, i, "amount", e.target.value)} />
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-outline-primary mb-4" onClick={() => handleAddPayment(setCustomerPayments)}>➕ Add Payment</button>

        <label className="form-label">Vendor Payments</label>
        {vendorPayments.map((p, i) => (
          <div className="row g-2 mb-2" key={i}>
            <div className="col-md-6">
              <input type="date" className="form-control" value={p.date} onChange={e => handleChangePayment(setVendorPayments, i, "date", e.target.value)} />
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="Amount" value={p.amount} onChange={e => handleChangePayment(setVendorPayments, i, "amount", e.target.value)} />
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-outline-primary mb-4" onClick={() => handleAddPayment(setVendorPayments)}>➕ Add Payment</button>

        <label className="form-label">Documents</label>
        {uploadedDocs.length > 0 && (
          <ul className="mb-2">
            {uploadedDocs.map((doc, index) => (
              <li key={index}><a href={doc.filepath} target="_blank" rel="noopener noreferrer">{doc.filename}</a></li>
            ))}
          </ul>
        )}
        <input type="file" className="form-control mb-4" multiple onChange={e => uploadDocuments(e.target.files)} />

        <div className="d-grid mt-3">
          <button type="submit" className="btn btn-outline-secondary">💾 Save Changes</button>
        </div>
      </form>
    </div>
  );
}

export default EditOrder;

