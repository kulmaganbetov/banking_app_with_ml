import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  error: string | null;
}

export default function Login({ onLogin, error }: LoginProps) {
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("demo123");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try { await onLogin(username, password); navigate("/dashboard"); }
    catch { /* error handled by hook */ }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
        className="glass-strong w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">S</div>
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-sm text-gray-400 mt-1">Sign in to Sentra Bank</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" placeholder="Enter username" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" placeholder="Enter password" />
          </div>
          {error && <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{error}</div>}
          <button type="submit" disabled={submitting}
            className="w-full py-2.5 text-sm font-semibold bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-lg transition-colors">
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 mt-6">Demo: <span className="text-gray-400">demo / demo123</span></p>
      </motion.div>
    </div>
  );
}
