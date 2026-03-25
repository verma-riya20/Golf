import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const ENABLE_ADMIN_SIGNUP = import.meta.env.VITE_ENABLE_ADMIN_SIGNUP === "true";

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "USER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = ENABLE_ADMIN_SIGNUP
        ? form
        : { fullName: form.fullName, email: form.email, password: form.password, role: "USER" };

      await register(payload);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md surface p-6">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-slate-600">Get instant access to paid learning packs.</p>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <input
          className="input"
          placeholder="Full name"
          value={form.fullName}
          onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Password (min 8 chars)"
          type="password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          required
          minLength={8}
        />
        {ENABLE_ADMIN_SIGNUP && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Account Role</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            <p className="text-xs text-slate-500">Demo mode only: choose Admin to access /admin panel.</p>
          </div>
        )}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already registered? <Link to="/login" className="font-semibold text-tide">Sign in</Link>
      </p>
    </section>
  );
};
