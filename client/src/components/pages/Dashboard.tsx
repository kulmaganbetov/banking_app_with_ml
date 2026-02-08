import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { User, Account, Transaction, SecurityStatus } from "../../types";
import * as api from "../../services/api";

interface DashboardProps {
  user: User | null;
  onRefresh: () => void;
}

function formatKZT(amount: number): string {
  return new Intl.NumberFormat("kk-KZ").format(amount) + " ₸";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const card = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } },
});

export default function Dashboard({ user, onRefresh }: DashboardProps) {
  const accounts = user?.accounts ?? [];
  const [selectedAccId, setSelectedAccId] = useState(accounts[0]?.id ?? "");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [secStatus, setSecStatus] = useState<SecurityStatus | null>(null);
  const navigate = useNavigate();

  const selectedAcc = accounts.find((a) => a.id === selectedAccId) ?? accounts[0];

  useEffect(() => {
    onRefresh();
    async function load() {
      try {
        const [txs, status] = await Promise.all([api.getTransactions(), api.getSecurityStatus()]);
        setTransactions(txs);
        setSecStatus(status);
      } catch { /* ignore */ }
    }
    load();
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && !accounts.find((a) => a.id === selectedAccId)) {
      setSelectedAccId(accounts[0].id);
    }
  }, [accounts, selectedAccId]);

  const filteredTx = transactions
    .filter((t) => t.fromAccountId === selectedAccId || t.toAccountId === selectedAccId)
    .slice(0, 5);

  const threatColor: Record<string, string> = {
    LOW: "text-accent", MEDIUM: "text-warning", HIGH: "text-orange-500", CRITICAL: "text-danger",
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
        <h1 className="text-2xl font-bold">Welcome, {user?.fullName?.split(" ")[0] ?? "User"}</h1>
        <p className="text-sm text-gray-400 mt-1">Sentra Bank — Smart Banking Platform</p>
      </div>

      {/* Account Switcher */}
      <div className="flex gap-4">
        {accounts.map((acc) => (
          <motion.button
            key={acc.id}
            onClick={() => setSelectedAccId(acc.id)}
            whileTap={{ scale: 0.97 }}
            className={`relative flex-1 p-5 rounded-2xl border transition-all text-left ${
              acc.id === selectedAccId
                ? "bg-white/10 border-primary/40 shadow-lg shadow-primary/5"
                : "bg-white/5 border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                acc.type === "checking"
                  ? "bg-primary/15 text-primary"
                  : "bg-purple-500/15 text-purple-400"
              }`}>
                {acc.type === "checking" ? "Primary" : "Savings"}
              </span>
              {acc.id === selectedAccId && (
                <motion.div layoutId="active-dot" className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <p className="text-2xl font-bold">{formatKZT(acc.balance)}</p>
            <p className="text-xs text-gray-500 mt-1 font-mono">{acc.accountNumber}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
              <span>Limit: {formatKZT(acc.dailyLimit)}/day</span>
              <span className="text-gray-600">|</span>
              <span>Spent: {formatKZT(acc.dailySpent)}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div {...card(0)} className="glass p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Selected Account</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedAcc?.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {selectedAcc ? formatKZT(selectedAcc.balance) : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">{selectedAcc?.label}</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div {...card(1)} className="glass p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Security Status</p>
          {secStatus ? (
            <>
              <p className={`text-3xl font-bold ${threatColor[secStatus.overallThreatLevel]}`}>
                {secStatus.overallThreatLevel === "LOW" ? "SAFE" : secStatus.overallThreatLevel}
              </p>
              <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusBadgeColor[secStatus.overallThreatLevel]}`}>
                {secStatus.blockedTransactions} threats blocked
              </span>
            </>
          ) : <p className="text-gray-500">Loading...</p>}
        </motion.div>

        <motion.div {...card(2)} className="glass p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Transactions</p>
          <p className="text-3xl font-bold text-white">{secStatus?.totalTransactions ?? "—"}</p>
          <p className="text-xs text-gray-500 mt-2">
            {secStatus?.safeTransactions ?? 0} completed &middot; {secStatus?.blockedTransactions ?? 0} blocked
          </p>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <button onClick={() => navigate("/transactions")} className="text-xs text-primary hover:text-primary-dark transition-colors">View all</button>
        </div>
        <div className="space-y-3">
          {filteredTx.length === 0 && <p className="text-sm text-gray-500">No transactions for this account.</p>}
          {filteredTx.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  tx.status === "BLOCKED" ? "bg-danger/15 text-danger" : tx.transferType === "internal" ? "bg-purple-500/15 text-purple-400" : "bg-accent/15 text-accent"
                }`}>
                  {tx.status === "BLOCKED" ? "✕" : tx.transferType === "internal" ? "↔" : "✓"}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.recipient}</p>
                  <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${tx.status === "BLOCKED" ? "text-danger line-through" : "text-white"}`}>
                  {tx.toAccountId === selectedAccId ? "+" : "-"}{formatKZT(tx.amount)}
                </p>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className={`text-xs ${tx.status === "BLOCKED" ? "text-danger" : "text-gray-500"}`}>{tx.status}</span>
                  {tx.transferType === "internal" && <span className="text-xs px-1.5 py-0 bg-purple-500/10 text-purple-400 rounded">INT</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
