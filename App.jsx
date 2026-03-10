import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TechRefLeads from "./pages/TechRefLeads";
import Users from "./pages/Users";
import L2Page from "./pages/L2Page";
import NewConnPage from "./pages/NewConnPage";
import ReactivationPage from "./pages/ReactivationPage";
import UpsellPage from "./pages/UpsellPage";
import TasksPage from "./pages/TasksPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tech-ref-leads" element={<TechRefLeads />} />
        <Route path="users" element={<Users />} />
        <Route path="l2" element={<L2Page />} />
        <Route path="new-conn" element={<NewConnPage />} />
        <Route path="reactivation" element={<ReactivationPage />} />
        <Route path="upsell" element={<UpsellPage />} />
        <Route path="tasks" element={<TasksPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}