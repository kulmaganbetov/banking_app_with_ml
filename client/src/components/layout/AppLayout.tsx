import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import type { User } from "../../types";

interface AppLayoutProps {
  user: User | null;
  onLogout: () => void;
}

export default function AppLayout({ user, onLogout }: AppLayoutProps) {
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar fullName={user.fullName} onLogout={onLogout} />
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
