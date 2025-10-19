import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import AdminPage from "../pages/AdminPage";
import VentasPage from "../pages/VentasPage";
import RentabilidadPage from "../pages/RentabilidadPage";
import ProductosPage from "../pages/ProductosPage";
import CaloriasPage from "../pages/CaloriasPage";
import Profile from "../pages/Profile"; // <-- Importa tu perfil
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Público */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Admin - acceso total */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rentabilidad"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <RentabilidadPage />
          </ProtectedRoute>
        }
      />

      {/* Empleado - todo excepto rentabilidad */}
      <Route
        path="/ventas"
        element={
          <ProtectedRoute allowedRoles={["admin", "empleado", "cliente"]}>
            <VentasPage />
          </ProtectedRoute>
        }
      />

      {/* Cliente y público */}
      <Route
        path="/productos"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ProductosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/calorias"
        element={
          <ProtectedRoute allowedRoles={["admin", "empleado", "cliente"]}>
            <CaloriasPage />
          </ProtectedRoute>
        }
      />

      {/* Perfil - cualquier usuario autenticado */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["admin", "empleado", "cliente"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
