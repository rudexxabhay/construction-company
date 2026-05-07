import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../api/axios";

const ProtectedRoute = () => {
  const token = localStorage.getItem("adminToken");
  const [status, setStatus] = useState(token ? "checking" : "guest");

  useEffect(() => {
    if (!token) return;

    let active = true;
    api.get("/api/auth/me")
      .then(({ data }) => {
        if (!active) return;
        localStorage.setItem("adminUser", JSON.stringify(data.user));
        setStatus("authorized");
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setStatus("guest");
      });

    return () => {
      active = false;
    };
  }, [token]);

  if (status === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-50 px-4">
        <p className="text-sm font-bold text-zinc-600">Checking admin session...</p>
      </main>
    );
  }

  return status === "authorized" ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
