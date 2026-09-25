import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import MedicalRecords from "./pages/MedicalRecords";
import Timeline from "./pages/Timeline";
import Medications from "./pages/Medications";
import Appointments from "./pages/Appointments";
import HealthDashboard from "./pages/HealthDashboard";
import SecureSharing from "./pages/SecureSharing";
import Assistant from "./pages/Assistant";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/medical-records" element={<MedicalRecords />}/>
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/health-dashboard" element={<HealthDashboard/>} />
          <Route path="/secure-sharing" element={<SecureSharing />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;