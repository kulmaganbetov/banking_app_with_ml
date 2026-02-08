import { Transaction, SecurityLog } from "../types";
import { analyzeTransaction } from "../ml/decisionEngine";
import {
  addTransaction,
  addSecurityLog,
  updateAccountBalance,
  addDailySpent,
  getAllTransactions,
  getAccount,
} from "../data/store";

let seeded = false;

interface SeedEntry {
  id: string;
  logId: string;
  fromAccountId: string;
  toAccountId?: string;
  transferType: "internal" | "external";
  recipient: string;
  amount: number;
  description: string;
  automated?: boolean;
  deviceId?: string;
  timestamp: string;
}

const SEED_DATA: SeedEntry[] = [
  // ── Normal external transactions (checking) ──
  {
    id: "tx-seed-001", logId: "log-seed-001",
    fromAccountId: "acc-checking-001", transferType: "external",
    recipient: "Almaty Electric Co.", amount: 15_200,
    description: "Monthly electricity bill",
    timestamp: "2026-02-07T09:15:00.000Z",
  },
  {
    id: "tx-seed-002", logId: "log-seed-002",
    fromAccountId: "acc-checking-001", transferType: "external",
    recipient: "KazTelecom", amount: 8_500,
    description: "Internet subscription",
    timestamp: "2026-02-06T14:30:00.000Z",
  },
  {
    id: "tx-seed-003", logId: "log-seed-003",
    fromAccountId: "acc-checking-001", transferType: "external",
    recipient: "Glovo KZ", amount: 4_200,
    description: "Food delivery",
    timestamp: "2026-02-07T19:45:00.000Z",
  },
  {
    id: "tx-seed-004", logId: "log-seed-004",
    fromAccountId: "acc-checking-001", transferType: "external",
    recipient: "Kaspi Магазин", amount: 32_000,
    description: "Electronics purchase",
    timestamp: "2026-02-04T16:20:00.000Z",
  },
  // ── Normal internal transfer ──
  {
    id: "tx-seed-005", logId: "log-seed-005",
    fromAccountId: "acc-checking-001", toAccountId: "acc-savings-001",
    transferType: "internal",
    recipient: "Savings", amount: 100_000,
    description: "Monthly savings deposit",
    timestamp: "2026-02-05T10:00:00.000Z",
  },
  // ── AI-blocked: Automated ransomware pattern ──
  {
    id: "tx-seed-006", logId: "log-seed-006",
    fromAccountId: "acc-checking-001", transferType: "external",
    recipient: "Unknown Account X-8832", amount: 1_200_000,
    description: "Wire transfer", automated: true,
    timestamp: "2026-02-08T02:10:00.000Z",
  },
  // ── AI-blocked: Rapid-fire exfiltration ──
  {
    id: "tx-seed-007", logId: "log-seed-007",
    fromAccountId: "acc-checking-001", transferType: "external",
    recipient: "CryptoWallet-anon-991", amount: 750_000,
    description: "Urgent transfer", automated: true,
    timestamp: "2026-02-08T02:10:30.000Z",
  },
  // ── AI-blocked: High-value suspicious ──
  {
    id: "tx-seed-008", logId: "log-seed-008",
    fromAccountId: "acc-checking-001", transferType: "external",
    recipient: "OffshoreHoldings-334", amount: 950_000,
    description: "Investment transfer", automated: true,
    timestamp: "2026-02-08T02:11:00.000Z",
  },
  // ── Rule-blocked: Daily limit exceeded (savings) ──
  {
    id: "tx-seed-009", logId: "log-seed-009",
    fromAccountId: "acc-savings-001", transferType: "external",
    recipient: "Real Estate Agency KZ", amount: 1_500_000,
    description: "Property down payment",
    timestamp: "2026-02-07T15:30:00.000Z",
  },
  // ── Rule-blocked: Suspicious time + new device ──
  {
    id: "tx-seed-010", logId: "log-seed-010",
    fromAccountId: "acc-checking-001", transferType: "external",
    recipient: "Unknown Merchant", amount: 280_000,
    description: "Night purchase",
    deviceId: "device-unknown-X92",
    timestamp: "2026-02-07T22:30:00.000Z", // UTC 22:30 = KZ 04:30
  },
  // ── Normal savings transaction ──
  {
    id: "tx-seed-011", logId: "log-seed-011",
    fromAccountId: "acc-savings-001", transferType: "external",
    recipient: "Nazarbayev University", amount: 450_000,
    description: "Tuition fee installment",
    timestamp: "2026-02-05T11:00:00.000Z",
  },
];

export function seedTransactions(): void {
  if (seeded || getAllTransactions().length > 0) return;
  seeded = true;

  const userId = "user-001";

  for (const entry of SEED_DATA) {
    const account = getAccount(entry.fromAccountId);
    if (!account) continue;

    const { decision, shouldBlock } = analyzeTransaction({
      userId,
      recipient: entry.recipient,
      amount: entry.amount,
      automated: entry.automated,
      account,
      timestamp: entry.timestamp,
      deviceId: entry.deviceId,
    });

    const transaction: Transaction = {
      id: entry.id,
      userId,
      fromAccountId: entry.fromAccountId,
      toAccountId: entry.toAccountId,
      recipient: entry.recipient,
      transferType: entry.transferType,
      amount: entry.amount,
      currency: "KZT",
      status: shouldBlock ? "BLOCKED" : "COMPLETED",
      timestamp: entry.timestamp,
      description: entry.description,
      mlDecision: decision,
    };

    addTransaction(transaction);

    const log: SecurityLog = {
      id: entry.logId,
      timestamp: entry.timestamp,
      transactionId: entry.id,
      threatType: decision.threatType,
      riskScore: decision.riskScore,
      confidence: decision.confidence,
      label: decision.label,
      actionTaken: shouldBlock ? "BLOCKED" : "ALLOWED",
      details: `${entry.transferType === "internal" ? "Internal" : "External"} transfer of ${entry.amount} KZT to ${entry.recipient} ${shouldBlock ? "blocked" : "allowed"}. Risk: ${decision.riskScore}`,
      blockReasons: decision.blockReasons,
    };
    addSecurityLog(log);

    if (!shouldBlock) {
      updateAccountBalance(entry.fromAccountId, -entry.amount);
      addDailySpent(entry.fromAccountId, entry.amount);
      if (entry.transferType === "internal" && entry.toAccountId) {
        updateAccountBalance(entry.toAccountId, entry.amount);
      }
    }
  }
}
