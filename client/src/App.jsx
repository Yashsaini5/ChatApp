import { BrowserRouter as Router, Routes, Route , useParams, useLocation} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.css";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* ✅ Route for direct chat */}
        <Route path="/DirectChat/:id" element={<Home />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );
}

export default App;
