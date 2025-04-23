import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Vendors from "./pages/Vendors";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Ledger from "./pages/Ledger";
import Orders from "./pages/Orders";
import OrdersNew from "./pages/OrdersNew";
import EditOrder from "./pages/EditOrder";


function App() {
  return (
    <Router>
      <div className="d-flex vh-100 text-dark">
        {/* Sidebar */}
        <aside className="bg-white border-end shadow-sm p-4" style={{ width: "250px", minHeight: "100vh" }}>
          <div className="d-flex align-items-center mb-4">
            <span className="fs-3">🚛</span>
            <h4 className="ms-2 mb-0 fw-bold text-primary">Trucking Broker</h4>
          </div>
          <nav className="nav flex-column gap-2">
            <Link to="/" className="nav-link px-2 py-1 rounded text-dark fw-medium hover:bg-light">🏠 Dashboard</Link>
            <Link to="/orders" className="nav-link px-2 py-1 rounded text-dark fw-medium hover:bg-light">📦 Orders</Link>
            <Link to="/customers" className="nav-link px-2 py-1 rounded text-dark fw-medium hover:bg-light">👥 Customers</Link>
            <Link to="/vendors" className="nav-link px-2 py-1 rounded text-dark fw-medium hover:bg-light">🏭 Vendors</Link>
            <Link to="/invoices" className="nav-link px-2 py-1 rounded text-dark fw-medium hover:bg-light">🧾 Invoices</Link>
            <Link to="/payments" className="nav-link px-2 py-1 rounded text-dark fw-medium hover:bg-light">💰 Payments</Link>
            <Link to="/ledger" className="nav-link px-2 py-1 rounded text-dark fw-medium hover:bg-light">📒 Ledger</Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-grow-1 p-4 bg-light overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders/new" element={<OrdersNew />} />
            <Route path="/orders/edit/:id" element={<EditOrder />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/ledger" element={<Ledger />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
