import { Navigate, Route, Routes } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PaymentPage from "../pages/PaymentPage";

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={localStorage.getItem("accessToken") ? "/payment" : "/login"}
            replace
          />
        }
      />
      <Route path="/login" element={<AuthCard mode="login" />} />
      <Route path="/register" element={<AuthCard mode="register" />} />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
