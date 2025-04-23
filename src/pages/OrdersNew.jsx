import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { BASE_URL } from "../config";

export default function OrderFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingOrder = location.state?.order || null;

  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [orderNumberOptions, setOrderNumberOptions] = useState([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState("");
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [customerRate, setCustomerRate] = useState("");
  const [customerExpenseType, setCustomerExpenseType] = useState("");
  const [customerExpenseValue, setCustomerExpenseValue] = useState("");
  const [transporterRate, setTransporterRate] = useState("");
  const [transporterExpenseType, setTransporterExpenseType] = useState("");
  const [transporterExpenseValue, setTransporterExpenseValue] = useState("");

  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");

  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");

  const [customerPayments, setCustomerPayments] = useState([{ date: "", amount: "" }]);
  const [vendorPayments, setVendorPayments] = useState([{ date: "", amount: "" }]);

  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [showMessage, setShowMessage] = useState(false);

  const expenseOptions = [
    { value: "Toll", label: "Toll" },
    { value: "Halting", label: "Halting" },
    { value: "Challan", label: "Challan" },
    { value: "Others", label: "Others" }
  ];

  const vehicleTypeOptions = [
    { value: "Closed Container", label: "Closed Container" },
    { value: "Open Body", label: "Open Body" },
    { value: "Trailer", label: "Trailer" }
  ];

  useEffect(() => {
    axios.get(`${BASE_URL}/orders/latest-id`).then(res => {
      const latest = res.data.latest_id || 100;
      const nextOptions = Array.from({ length: 5 }, (_, i) => `#${latest + i + 1}`);
      setOrderNumberOptions(nextOptions);
      if (!editingOrder) setSelectedOrderNumber(nextOptions[0]);
    });

    axios.get(`${BASE_URL}/customers`).then(res => setCustomers(res.data));
    axios.get(`${BASE_URL}/vendors`).then(res => setVendors(res.data));
  }, []);

  const uploadDocuments = async (orderId) => {
    if (!documents.length) return;

    const formData = new FormData();
    formData.append("order_id", orderId);
    for (let file of documents) {
      formData.append("files", file);
    }

    try {
      await axios.post(`${BASE_URL}/documents/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("✅ All documents uploaded");
    } catch (err) {
      console.error("❌ Document upload failed:", err.response?.data || err);
    }
  };

  const uploadPayments = async (orderId) => {
    try {
      for (const p of customerPayments) {
        if (p.amount && p.date) {
          await axios.post(`${BASE_URL}/payments/`, {
            order_id: orderId,
            type: "customer",
            amount: parseFloat(p.amount),
            date: p.date,
          });
        }
      }
  
      for (const p of vendorPayments) {
        if (p.amount && p.date) {
          await axios.post(`${BASE_URL}/payments/`, {
            order_id: orderId,
            type: "vendor",
            amount: parseFloat(p.amount),
            date: p.date,
          });
        }
      }
  
      console.log("✅ Payments uploaded");
    } catch (err) {
      console.error("❌ Payment upload failed:", err.response?.data || err);
    }
  };
  

  const handleCreateOrder = async () => {
    try {
      const payload = {
        order_number: selectedOrderNumber,
        date: orderDate,
        status: "Open",
        payment_status: "Unpaid",
        customer_name: selectedCustomer?.label.split(" (")[0] || "",
        customer_contact: selectedCustomer?.label.split(" (")[1]?.replace(")", "") || "",
        customer_rate: parseInt(customerRate),
        customer_expenses: `${customerExpenseType}: ${customerExpenseValue}`,
        transporter_name: selectedVendor?.label.split(" (")[0] || "",
        transporter_contact: selectedVendor?.label.split(" (")[1]?.replace(")", "") || "",
        transporter_rate: parseInt(transporterRate),
        transporter_expenses: `${transporterExpenseType}: ${transporterExpenseValue}`,
        from_location: fromLocation,
        to_location: toLocation,
        vehicle_number: vehicleNumber,
        driver_name: driverName,
        driver_contact: driverContact,
        vehicle_type: vehicleType
      };

      if (editingOrder) {
        await axios.patch(`${BASE_URL}/orders/${editingOrder.id}`, payload);
        setMessage("✅ Order updated successfully");
      } else {
        const response = await axios.post(`${BASE_URL}/orders/`, payload);
        const orderId = response.data.id;
        await uploadDocuments(orderId);
        await uploadPayments(orderId);
        setMessage("✅ Order created successfully");
      }

      setMessageType("success");
      setShowMessage(true);
    } catch (err) {
      console.error("❌ Failed to save order:", err.response?.data || err);
      setMessage("❌ Failed to save order. See console for details.");
      setMessageType("danger");
      setShowMessage(true);
    }
  };

  const addPaymentRow = (setter) => setter(prev => [...prev, { date: "", amount: "" }]);
  const updatePaymentField = (setter, index, field, value) => setter(prev => {
    const updated = [...prev];
    updated[index][field] = value;
    return updated;
  });

  const handleDocumentUpload = (e) => setDocuments([...e.target.files]);

  return (
    <div className="container my-5">
      {showMessage && (
        <div className={`alert alert-${messageType} text-center mx-auto`} style={{ maxWidth: "500px", position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", zIndex: 1055, boxShadow: "0 0 20px rgba(0,0,0,0.2)" }}>
          <p className="mb-2">{message}</p>
          <button className="btn btn-sm btn-outline-dark" onClick={() => {
            setShowMessage(false);
            if (messageType === "success" && !editingOrder) navigate("/orders");
          }}>OK</button>
        </div>
      )}

      <h2 className="fw-bold text-primary mb-4">📝 {editingOrder ? "Edit Order" : "New Order"}</h2>
      <div className="card p-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Order Number</label>
            <select className="form-select" value={selectedOrderNumber} onChange={e => setSelectedOrderNumber(e.target.value)}>
              {orderNumberOptions.map(num => <option key={num} value={num}>{num}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Order Date</label>
            <input type="date" className="form-control" value={orderDate} onChange={e => setOrderDate(e.target.value)} />
          </div>
        </div>

        <hr className="my-4" />

        <label className="form-label">Customer</label>
        <Select options={customers.map(c => ({ value: c.id, label: `${c.name} (${c.contact})` }))} value={selectedCustomer} onChange={setSelectedCustomer} placeholder="Search or select customer" className="mb-3" />
        <input className="form-control mb-2" placeholder="Customer Freight Rate (₹)" value={customerRate} onChange={e => setCustomerRate(e.target.value)} />
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <Select options={expenseOptions} value={expenseOptions.find(o => o.value === customerExpenseType)} onChange={selected => setCustomerExpenseType(selected.value)} placeholder="Expense Type" />
          </div>
          <div className="col-md-6">
            <input className="form-control" placeholder="Charge (₹)" value={customerExpenseValue} onChange={e => setCustomerExpenseValue(e.target.value)} />
          </div>
        </div>

        <label className="form-label">Transporter</label>
        <Select options={vendors.map(v => ({ value: v.id, label: `${v.name} (${v.contact})` }))} value={selectedVendor} onChange={setSelectedVendor} placeholder="Search or select transporter" className="mb-3" />
        <input className="form-control mb-2" placeholder="Transporter Freight Rate (₹)" value={transporterRate} onChange={e => setTransporterRate(e.target.value)} />
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <Select options={expenseOptions} value={expenseOptions.find(o => o.value === transporterExpenseType)} onChange={selected => setTransporterExpenseType(selected.value)} placeholder="Expense Type" />
          </div>
          <div className="col-md-6">
            <input className="form-control" placeholder="Charge (₹)" value={transporterExpenseValue} onChange={e => setTransporterExpenseValue(e.target.value)} />
          </div>
        </div>

        <label className="form-label">Route</label>
        <div className="row g-2">
          <div className="col-md-6">
            <input className="form-control" placeholder="From Location" value={fromLocation} onChange={e => setFromLocation(e.target.value)} />
          </div>
          <div className="col-md-6">
            <input className="form-control" placeholder="To Location" value={toLocation} onChange={e => setToLocation(e.target.value)} />
          </div>
        </div>

        <hr className="my-4" />

        <label className="form-label">Vehicle Details</label>
        <Select options={vehicleTypeOptions} value={vehicleTypeOptions.find(o => o.value === vehicleType)} onChange={selected => setVehicleType(selected.value)} placeholder="Select Vehicle Type" className="mb-2" />
        <input className="form-control mb-2" placeholder="Vehicle Number" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} />
        <input className="form-control mb-2" placeholder="Driver Name" value={driverName} onChange={e => setDriverName(e.target.value)} />
        <input className="form-control mb-3" placeholder="Driver Contact" value={driverContact} onChange={e => setDriverContact(e.target.value)} />

        <hr className="my-4" />

        <label className="form-label">Customer Payments</label>
        {customerPayments.map((p, i) => (
          <div className="row g-2 mb-2" key={i}>
            <div className="col-md-6">
              <input type="date" className="form-control" value={p.date} onChange={e => updatePaymentField(setCustomerPayments, i, "date", e.target.value)} />
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="Amount (₹)" value={p.amount} onChange={e => updatePaymentField(setCustomerPayments, i, "amount", e.target.value)} />
            </div>
          </div>
        ))}
        <button className="btn btn-sm btn-outline-primary mb-4" onClick={() => addPaymentRow(setCustomerPayments)}>➕ Add Payment</button>

        <label className="form-label">Vendor Payments</label>
        {vendorPayments.map((p, i) => (
          <div className="row g-2 mb-2" key={i}>
            <div className="col-md-6">
              <input type="date" className="form-control" value={p.date} onChange={e => updatePaymentField(setVendorPayments, i, "date", e.target.value)} />
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="Amount (₹)" value={p.amount} onChange={e => updatePaymentField(setVendorPayments, i, "amount", e.target.value)} />
            </div>
          </div>
        ))}
        <button className="btn btn-sm btn-outline-primary mb-4" onClick={() => addPaymentRow(setVendorPayments)}>➕ Add Payment</button>

        <label className="form-label">Documents</label>
        <input type="file" className="form-control mb-4" multiple onChange={handleDocumentUpload} />

        <div className="d-grid gap-2 mt-3">
          <button className="btn btn-outline-secondary" onClick={handleCreateOrder}>💾 {editingOrder ? "Save" : "Save as Draft"}</button>
          {!editingOrder && <button className="btn btn-success" onClick={handleCreateOrder}>✅ Create Order</button>}
        </div>
      </div>
    </div>
  );
}
