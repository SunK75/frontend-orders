import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./config";

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    gst_number: "",
    address: ""
  });
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = () => {
    axios.get("${BASE_URL}/vendors/")
      .then((res) => setVendors(res.data))
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      axios.put(`${BASE_URL}/vendors/${editingId}`, form)
        .then(() => {
          setMessage("✅ Vendor updated!");
          resetForm();
          fetchVendors();
        })
        .catch(() => setMessage("❌ Error updating vendor."));
    } else {
      axios.post("${BASE_URL}/vendors/", form)
        .then(() => {
          setMessage("✅ Vendor added!");
          resetForm();
          fetchVendors();
        })
        .catch(() => setMessage("❌ Error adding vendor."));
    }
  };

  const handleEdit = (vendor) => {
    setForm(vendor);
    setEditingId(vendor.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      axios.delete(`${BASE_URL}/vendors/${id}`)
        .then(() => {
          setMessage("✅ Vendor deleted.");
          fetchVendors();
        })
        .catch(() => setMessage("❌ Error deleting vendor."));
    }
  };

  const resetForm = () => {
    setForm({ name: "", contact: "", gst_number: "", address: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.contact.toLowerCase().includes(search.toLowerCase()) ||
    v.gst_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container my-5">
      <h2 className="mb-4 fw-bold text-primary">🏋️ Vendor List
      </h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by name, contact or GST"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-success ms-3" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "➕ Add Vendor"}
        </button>
      </div>

      {filteredVendors.length > 0 ? (
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
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>{vendor.name}</td>
                <td>{vendor.contact}</td>
                <td>{vendor.gst_number}</td>
                <td>{vendor.address}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(vendor)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(vendor.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted">No vendors found.</p>
      )}

      {showForm && (
        <div className="bg-light p-4 mt-4 rounded shadow-sm">
          <h4 className="text-secondary mb-3">
            {editingId ? "✏️ Edit Vendor" : "➕ Add New Vendor"}
          </h4>
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
                {editingId ? "Update Vendor" : "Save Vendor"}
              </button>
            </div>
          </form>
        </div>
      )}

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}

export default Vendors;