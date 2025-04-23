import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    contact: "",
    gst_number: "",
    address: ""
  });
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    axios.get(`${BASE_URL}/customers`)
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.id) {
      axios.put(`${BASE_URL}/${form.id}`, form)
        .then(() => {
          setMessage("✅ Customer updated!");
          setForm({ id: null, name: "", contact: "", gst_number: "", address: "" });
          setShowForm(false);
          fetchCustomers();
        })
        .catch(() => setMessage("❌ Error updating customer."));
    } else {
      axios.post(`${BASE_URL}/customers`, form)
        .then(() => {
          setMessage("✅ Customer added!");
          setForm({ id: null, name: "", contact: "", gst_number: "", address: "" });
          setShowForm(false);
          fetchCustomers();
        })
        .catch(() => setMessage("❌ Error adding customer."));
    }
  };

  const handleEdit = (cust) => {
    setForm(cust);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      axios.delete(`${BASE_URL}/customers/${id}`)
        .then(() => {
          setMessage("🗑️ Customer deleted!");
          fetchCustomers();
        })
        .catch(() => setMessage("❌ Error deleting customer."));
    }
  };

  const filteredCustomers = customers.filter(cust =>
    cust.name.toLowerCase().includes(search.toLowerCase()) ||
    cust.contact.toLowerCase().includes(search.toLowerCase()) ||
    cust.gst_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container my-5">
      <h2 className="mb-4 fw-bold text-primary">📋 Customer List</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by name, contact or GST"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-success ms-3" onClick={() => {
          setShowForm(!showForm);
          setForm({ id: null, name: "", contact: "", gst_number: "", address: "" });
        }}>
          {showForm ? "Close" : "➕ Add Customer"}
        </button>
      </div>

      {filteredCustomers.length > 0 ? (
        <table className="table table-bordered table-striped">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>GST Number</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((cust) => (
              <tr key={cust.id}>
                <td>{cust.name}</td>
                <td>{cust.contact}</td>
                <td>{cust.gst_number}</td>
                <td>{cust.address}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(cust)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cust.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted">No customers found.</p>
      )}

      {showForm && (
        <div className="bg-light p-4 mt-4 rounded shadow-sm">
          <h4 className="text-secondary mb-3">{form.id ? "✏️ Edit Customer" : "➕ Add New Customer"}</h4>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Contact</label>
              <input type="text" name="contact" value={form.contact} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">GST Number</label>
              <input type="text" name="gst_number" value={form.gst_number} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-12">
              <label className="form-label">Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100">
                {form.id ? "Update Customer" : "Save Customer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}

export default Customers;
