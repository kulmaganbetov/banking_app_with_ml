import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { User, Account, Transaction, TransactionResult, TransferType } from "../../types";
import * as api from "../../services/api";

interface TransactionsProps {
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

export default function Transactions({ user, onRefresh }: TransactionsProps) {
  const accounts = user?.accounts ?? [];
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transferType, setTransferType] = useState<TransferType>("external");
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id ?? "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id ?? "");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TransactionResult | null>(null);

  const load = async () => {
    try { const txs = await api.getTransactions(); setTransactions(txs); } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!fromAccountId || isNaN(numAmount) || numAmount <= 0) return;
    if (transferType === "external" && !recipient) return;

    setSubmitting(true);
    setResult(null);
    try {
      const targetAcc = transferType === "internal" ? accounts.find((a) => a.id === toAccountId) : null;
      const res = await api.createTransaction({
        fromAccountId,
        toAccountId: transferType === "internal" ? toAccountId : undefined,
        transferType,
        recipient: transferType === "internal" ? (targetAcc?.label ?? "Own Account") : recipient,
        amount: numAmount,
        description: description || undefined,
      });
      setResult(res);
      setRecipient("");
      setAmount("");
      setDescription("");
      await load();
      onRefresh();
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-gray-400 mt-1">Send money and view transaction history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Transaction Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Send Money</h2>

          {/* Transfer Type Toggle */}
          <div className="flex mb-5 bg-white/5 rounded-xl p-1">
            {(["external", "internal"] as TransferType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTransferType(t)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  transferType === t ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {t === "external" ? "External Transfer" : "Between Accounts"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* From Account */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">From Account</label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-gray-900">
                    {acc.label} — {formatKZT(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            {transferType === "internal" ? (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">To Account</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  {accounts.filter((a) => a.id !== fromAccountId).map((acc) => (
                    <option key={acc.id} value={acc.id} className="bg-gray-900">
                      {acc.label} — {formatKZT(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Recipient</label>
                <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient name"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Amount (KZT)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" min="1"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Description (optional)</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this for?"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-2.5 text-sm font-semibold bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-lg transition-colors">
              {submitting ? "Processing..." : transferType === "internal" ? "Transfer Between Accounts" : "Send Transaction"}
            </button>
          </form>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className={`mt-4 p-3 rounded-lg border text-sm ${result.blocked ? "bg-danger/10 border-danger/20 text-danger" : "bg-accent/10 border-accent/20 text-accent"}`}>
                {result.blocked ? (
                  <>
                    <p className="font-semibold">Transaction Blocked</p>
                    <p className="text-xs mt-1 opacity-80">{result.warning}</p>
                    {result.transaction.mlDecision?.blockReasons.map((r, i) => (
                      <div key={i} className="mt-1 text-xs flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${r.category === "ai-behavioral" ? "bg-danger" : "bg-warning"}`} />
                        {r.label}
                      </div>
                    ))}
                  </>
                ) : <p className="font-semibold">Transaction completed successfully</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Transaction History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">
                  <th className="text-left py-3 px-2">Recipient</th>
                  <th className="text-left py-3 px-2">Type</th>
                  <th className="text-right py-3 px-2">Amount</th>
                  <th className="text-center py-3 px-2">Status</th>
                  <th className="text-right py-3 px-2">Risk</th>
                  <th className="text-right py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className={`border-b border-white/5 ${tx.status === "BLOCKED" ? "bg-danger/5" : ""}`}>
                    <td className="py-3 px-2">
                      <p className="font-medium">{tx.recipient}</p>
                      <p className="text-xs text-gray-500">{tx.description || "—"}</p>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        tx.transferType === "internal" ? "bg-purple-500/15 text-purple-400" : "bg-white/10 text-gray-400"
                      }`}>
                        {tx.transferType === "internal" ? "Internal" : "External"}
                      </span>
                    </td>
                    <td className={`py-3 px-2 text-right font-semibold ${tx.status === "BLOCKED" ? "text-danger line-through" : "text-white"}`}>
                      {formatKZT(tx.amount)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        tx.status === "BLOCKED" ? "bg-danger/15 text-danger" : "bg-accent/15 text-accent"
                      }`}>{tx.status}</span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {tx.mlDecision ? (
                        <span className={`text-xs font-mono ${
                          tx.mlDecision.riskScore > 0.55 ? "text-danger" : tx.mlDecision.riskScore > 0.3 ? "text-warning" : "text-accent"
                        }`}>{(tx.mlDecision.riskScore * 100).toFixed(0)}%</span>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-400">{formatDate(tx.timestamp)}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-500">No transactions yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
