import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "../App.css";

function DashboardLayout() {
  return (
    <div className="app-background">
      <div className="leaf leaf-one">
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>

<div className="leaf leaf-two">
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>

<div className="leaf leaf-three">
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>

<div className="leaf leaf-four">
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>
      

      <Navbar />

      <div>
        <Sidebar />

        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default DashboardLayout;