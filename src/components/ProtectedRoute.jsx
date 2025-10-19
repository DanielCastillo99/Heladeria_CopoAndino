import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { role, loading } = useContext(AuthContext);

  if (loading) return <p>Cargando...</p>;

  // Si no está logueado, lo tratamos como "public"
  const currentRole = role || "public";

  // Si el rol actual está en la lista de permitidos, puede entrar
  if (allowedRoles.includes(currentRole)) {
    return children;
  }

  // Si no tiene permiso, redirigimos
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
