import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { settingsFallback } from "../data/fallbackData";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [settings, setSettings] = useState(settingsFallback);
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/api/settings")
      .then((res) => {
        setSettings({ ...settingsFallback, ...res.data });
        setLogo(res.data.logoUrl || null);
      })
      .catch(() => {
        setSettings(settingsFallback);
        setLogo(null);
      });
  }, []);

  if (localStorage.getItem("adminToken")) return <Navigate to="/secure-admin-dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/login", { email: form.email.trim(), password: form.password.trim() });
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      navigate("/secure-admin-dashboard");
    } catch (err) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white p-5 shadow-premium sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          {logo && <img className="h-11 w-11 shrink-0 rounded-md object-contain" src={`${logo}?v=${Date.now()}`} alt="logo" />}
          <div><h1 className="text-2xl font-black">Admin Login</h1><p className="text-sm text-zinc-500">Secure construction dashboard</p></div>
        </div>
        <label className="label">Email</label>
        <input className="input mb-4" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label className="label">Password</label>
        <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
        <button className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      </form>
    </main>
  );
};

export default AdminLogin;
