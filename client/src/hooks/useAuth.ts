import { useState, useEffect, useCallback } from "react";
import type { User } from "../types";
import * as api from "../services/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const loginAction = async (username: string, password: string) => {
    setError(null);
    try {
      const result = await api.login(username, password);
      localStorage.setItem("token", result.token);
      setUser(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    }
  };

  const logout = () => { localStorage.removeItem("token"); setUser(null); };

  const refreshUser = async () => {
    try { const me = await api.getMe(); setUser(me); } catch { /* ignore */ }
  };

  return { user, loading, error, login: loginAction, logout, refreshUser };
}
