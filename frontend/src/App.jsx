import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import ReportCrime from "./pages/citizen/ReportCrime";
import MyReports from "./pages/citizen/MyReports";

import PoliceDashboard from "./pages/police/PoliceDashboard";
import PoliceCases from "./pages/police/PoliceCases";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageReports from "./pages/admin/ManageReports";
import ManageOfficers from "./pages/admin/ManageOfficers";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageAdmins from "./pages/admin/ManageAdmins";

import ReportDetail from "./pages/ReportDetail";
import CrimeMapPage from "./pages/CrimeMapPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Citizen */}
      <Route path="/citizen" element={<ProtectedRoute role="citizen"><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/citizen/report" element={<ProtectedRoute role="citizen"><ReportCrime /></ProtectedRoute>} />
      <Route path="/citizen/reports" element={<ProtectedRoute role="citizen"><MyReports /></ProtectedRoute>} />
      <Route path="/citizen/reports/:id" element={<ProtectedRoute role="citizen"><ReportDetail /></ProtectedRoute>} />
      <Route path="/citizen/map" element={<ProtectedRoute role="citizen"><CrimeMapPage /></ProtectedRoute>} />
      <Route path="/citizen/notifications" element={<ProtectedRoute role="citizen"><NotificationsPage /></ProtectedRoute>} />
      <Route path="/citizen/profile" element={<ProtectedRoute role="citizen"><ProfilePage /></ProtectedRoute>} />

      {/* Police */}
      <Route path="/police" element={<ProtectedRoute role="police"><PoliceDashboard /></ProtectedRoute>} />
      <Route path="/police/cases" element={<ProtectedRoute role="police"><PoliceCases /></ProtectedRoute>} />
      <Route path="/police/cases/:id" element={<ProtectedRoute role="police"><ReportDetail /></ProtectedRoute>} />
      <Route path="/police/map" element={<ProtectedRoute role="police"><CrimeMapPage /></ProtectedRoute>} />
      <Route path="/police/notifications" element={<ProtectedRoute role="police"><NotificationsPage /></ProtectedRoute>} />
      <Route path="/police/profile" element={<ProtectedRoute role="police"><ProfilePage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><ManageReports /></ProtectedRoute>} />
      <Route path="/admin/reports/:id" element={<ProtectedRoute role="admin"><ReportDetail /></ProtectedRoute>} />
      <Route path="/admin/officers" element={<ProtectedRoute role="admin"><ManageOfficers /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/admins" element={<ProtectedRoute role="admin"><ManageAdmins /></ProtectedRoute>} />
      <Route path="/admin/map" element={<ProtectedRoute role="admin"><CrimeMapPage /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><NotificationsPage /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute role="admin"><ProfilePage /></ProtectedRoute>} />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
