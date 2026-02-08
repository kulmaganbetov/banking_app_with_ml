import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { SecurityLog, SecurityStatus } from "../../types";
import * as api from "../../services/api";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const COLORS = {
  safe: "#10b981",
  blocked: "#ef4444",
  warning: "#f59e0b",
  bg: "rgba(255,255,255,0.05)",
};

const card = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } },
});

export default function SecurityCenter() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [status, setStatus] = useState<SecurityStatus | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [l, s] = await Promise.all([
          api.getSecurityLogs(),
          api.getSecurityStatus(),
        ]);
        setLogs(l);
        setStatus(s);
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  const threatLevelColors: Record<string, string> = {
    LOW: "text-accent",
    MEDIUM: "text-warning",
    HIGH: "text-orange-500",
    CRITICAL: "text-danger",
  };

  const threatLevelBg: Record<string, string> = {
    LOW: "from-accent/20 to-accent/5",
    MEDIUM: "from-warning/20 to-warning/5",
    HIGH: "from-orange-500/20 to-orange-500/5",
    CRITICAL: "from-danger/20 to-danger/5",
  };

  // Chart data
  const pieData = status
    ? [
        { name: "Safe", value: status.safeTransactions },
        { name: "Blocked", value: status.blockedTransactions },
      ]
    : [];

  const riskDistribution = logs.reduce<Record<string, number>>((acc, log) => {
    const bucket =
      log.riskScore > 0.7
        ? "High (>70%)"
        : log.riskScore > 0.4
        ? "Medium (40-70%)"
        : "Low (<40%)";
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(riskDistribution).map(([name, count]) => ({
    name,
    count,
  }));

  const blockedLogs = logs.filter((l) => l.actionTaken === "BLOCKED");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Security Center</h1>
        <p className="text-sm text-gray-400 mt-1">
          AI-powered ransomware detection and threat monitoring
        </p>
      </div>

      {/* Threat Level + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          {...card(0)}
          className={`glass p-6 col-span-1 bg-gradient-to-br ${
            status ? threatLevelBg[status.overallThreatLevel] : ""
          }`}
        >
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            AI Threat Level
          </p>
          <p
            className={`text-4xl font-extrabold ${
              status ? threatLevelColors[status.overallThreatLevel] : "text-gray-500"
            }`}
          >
            {status?.overallThreatLevel ?? "—"}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Last scan: {status ? formatDate(status.lastScanTime) : "—"}
          </p>
        </motion.div>

        <motion.div {...card(1)} className="glass p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Total Analyzed
          </p>
          <p className="text-3xl font-bold text-white">
            {status?.totalTransactions ?? "—"}
          </p>
          <p className="text-xs text-gray-500 mt-2">transactions</p>
        </motion.div>

        <motion.div {...card(2)} className="glass p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Threats Blocked
          </p>
          <p className="text-3xl font-bold text-danger">
            {status?.blockedTransactions ?? "—"}
          </p>
          <p className="text-xs text-gray-500 mt-2">ransomware-like patterns</p>
        </motion.div>

        <motion.div {...card(3)} className="glass p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Safe Transactions
          </p>
          <p className="text-3xl font-bold text-accent">
            {status?.safeTransactions ?? "—"}
          </p>
          <p className="text-xs text-gray-500 mt-2">verified clean</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-6"
        >
          <h3 className="text-sm font-semibold mb-4">Transaction Safety Split</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={idx === 0 ? COLORS.safe : COLORS.blocked}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1f2937",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
              Safe
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-danger" />
              Blocked
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-6"
        >
          <h3 className="text-sm font-semibold mb-4">Risk Score Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1f2937",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        entry.name.startsWith("High")
                          ? COLORS.blocked
                          : entry.name.startsWith("Medium")
                          ? COLORS.warning
                          : COLORS.safe
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Blocked Transactions Detail */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass p-6"
      >
        <h2 className="text-lg font-semibold mb-4">
          Blocked &amp; Suspicious Transactions
        </h2>
        <div className="space-y-4">
          {blockedLogs.length === 0 && (
            <p className="text-sm text-gray-500">No threats detected.</p>
          )}
          {blockedLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 bg-danger/5 border border-danger/10 rounded-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-2 py-0.5 bg-danger/15 text-danger rounded">
                      {log.threatType}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{log.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">Risk Score</p>
                  <p className="text-lg font-bold text-danger">
                    {(log.riskScore * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Conf: {(log.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Full AI Decision Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass p-6"
      >
        <h2 className="text-lg font-semibold mb-4">AI Decision Logs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">
                <th className="text-left py-3 px-2">Time</th>
                <th className="text-left py-3 px-2">Threat Type</th>
                <th className="text-center py-3 px-2">Label</th>
                <th className="text-right py-3 px-2">Risk</th>
                <th className="text-right py-3 px-2">Confidence</th>
                <th className="text-center py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-white/5">
                  <td className="py-3 px-2 text-gray-400">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="py-3 px-2 font-mono text-xs">{log.threatType}</td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        log.label === "ransomware-like"
                          ? "bg-danger/15 text-danger"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      {log.label}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-2 text-right font-mono ${
                      log.riskScore > 0.55
                        ? "text-danger"
                        : log.riskScore > 0.3
                        ? "text-warning"
                        : "text-accent"
                    }`}
                  >
                    {(log.riskScore * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-gray-400">
                    {(log.confidence * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        log.actionTaken === "BLOCKED"
                          ? "bg-danger/15 text-danger"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      {log.actionTaken}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No AI decisions logged yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
