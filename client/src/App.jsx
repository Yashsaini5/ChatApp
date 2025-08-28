import { ToastContainer } from "react-toastify";
import "./App.css";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <Home/>
      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}

export default App;
