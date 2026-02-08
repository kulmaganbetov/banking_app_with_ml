import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/transactions", label: "Transactions", icon: "💸" },
  { path: "/security", label: "Security Center", icon: "🛡️" },
];

interface SidebarProps {
  fullName: string;
  onLogout: () => void;
}

export default function Sidebar({ fullName, onLogout }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">S</div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Sentra Bank</h1>
            <p className="text-xs text-gray-400">Smart Banking</p>
          </div>
        </motion.div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive ? "bg-primary/15 text-primary border border-primary/20" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`
            }>
            <span className="text-lg">{item.icon}</span>{item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
            {fullName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{fullName}</p>
            <button onClick={onLogout} className="text-xs text-gray-400 hover:text-danger transition-colors">Sign out</button>
          </div>
        </div>
      </div>
    </aside>
  );
}
