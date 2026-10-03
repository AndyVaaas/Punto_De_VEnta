import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Categorias from "./pages/Categorias";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";
import "./App.css";

function App() {
  return (
    <Router>
      <nav className="nav-bar">
        <div className="brand-container">
          <span className="brand-title">Punto de Venta</span>
        </div>

        <div className="nav-links">
          <Link to="/categorias" className="nav-link">Categorías</Link>
          <Link to="/productos" className="nav-link">Productos</Link>
          <Link to="/clientes" className="nav-link">Clientes</Link>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Productos />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/clientes" element={<Clientes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;