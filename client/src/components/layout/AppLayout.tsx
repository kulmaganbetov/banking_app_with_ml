import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import type { User } from "../../types";

interface AppLayoutProps {
  user: User | null;
  onLogout: () => void;
}

export default function AppLayout({ user, onLogout }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar fullName={user.fullName} onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-3 bg-gray-950/90 backdrop-blur-md border-b border-white/5">
        <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xs">S</div>
          <span className="text-sm font-bold tracking-tight">Sentra Bank</span>
        </div>
      </div>

      <main className="lg:ml-64 p-4 pt-18 sm:p-6 sm:pt-20 lg:p-8 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
