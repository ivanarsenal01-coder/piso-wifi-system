import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Wifi } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("admin@pisowifi.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4">
            <Wifi className="text-white" size={32} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Piso WiFi
          </h1>

          <p className="text-slate-500 mt-2">
            Admin Management System
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-blue-500">
              <Mail size={20} className="text-slate-400" />

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full outline-none text-slate-700"
                placeholder="admin@pisowifi.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-blue-500">
              <LockKeyhole size={20} className="text-slate-400" />

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full outline-none text-slate-700"
                placeholder="Enter admin password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;