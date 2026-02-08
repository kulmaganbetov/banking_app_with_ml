import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { User, Transaction, SecurityStatus } from "../../types";
import * as api from "../../services/api";

interface DashboardProps {
  user: User | null;
}

function formatKZT(amount: number): string {
  return new Intl.NumberFormat("kk-KZ").format(amount) + " ₸";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const card = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } },
});

export default function Dashboard({ user }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [secStatus, setSecStatus] = useState<SecurityStatus | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [txs, status, me] = await Promise.all([
          api.getTransactions(),
          api.getSecurityStatus(),
          api.getMe(),
        ]);
        setTransactions(txs.slice(0, 5));
        setSecStatus(status);
        setBalance(me.balance ?? null);
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  const threatColor: Record<string, string> = {
    LOW: "text-accent",
    MEDIUM: "text-warning",
    HIGH: "text-orange-500",
    CRITICAL: "text-danger",
  };

  const statusBadgeColor: Record<string, string> = {
    LOW: "bg-accent/15 text-accent border-accent/20",
    MEDIUM: "bg-warning/15 text-warning border-warning/20",
    HIGH: "bg-orange-500/15 text-orange-500 border-orange-500/20",
    CRITICAL: "bg-danger/15 text-danger border-danger/20",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {user?.fullName?.split(" ")[0] ?? "User"}
        </h1>
        <p className="text-sm text-gray-400 mt-1">Here's your account overview</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div {...card(0)} className="glass p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Account Balance</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {balance !== null ? formatKZT(balance) : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-2">{user?.accountNumber}</p>
        </motion.div>

        <motion.div {...card(1)} className="glass p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Security Status</p>
          {secStatus ? (
            <>
              <p className={`text-3xl font-bold ${threatColor[secStatus.overallThreatLevel]}`}>
                {secStatus.overallThreatLevel === "LOW" ? "SAFE" : secStatus.overallThreatLevel}
              </p>
              <span
                className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                  statusBadgeColor[secStatus.overallThreatLevel]
                }`}
              >
                {secStatus.blockedTransactions} threats blocked
              </span>
            </>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </motion.div>

        <motion.div {...card(2)} className="glass p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Transactions</p>
          <p className="text-3xl font-bold text-white">{secStatus?.totalTransactions ?? "—"}</p>
          <p className="text-xs text-gray-500 mt-2">
            {secStatus?.safeTransactions ?? 0} completed &middot;{" "}
            {secStatus?.blockedTransactions ?? 0} blocked
          </p>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="glass p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <button
            onClick={() => navigate("/transactions")}
            className="text-xs text-primary hover:text-primary-dark transition-colors"
          >
            View all
          </button>
        </div>
        <div className="space-y-3">
          {transactions.length === 0 && (
            <p className="text-sm text-gray-500">No transactions yet.</p>
          )}
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                    tx.status === "BLOCKED"
                      ? "bg-danger/15 text-danger"
                      : "bg-accent/15 text-accent"
                  }`}
                >
                  {tx.status === "BLOCKED" ? "✕" : "✓"}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.recipient}</p>
                  <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    tx.status === "BLOCKED" ? "text-danger line-through" : "text-white"
                  }`}
                >
                  -{formatKZT(tx.amount)}
                </p>
                <p
                  className={`text-xs ${
                    tx.status === "BLOCKED" ? "text-danger" : "text-gray-500"
                  }`}
                >
                  {tx.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
