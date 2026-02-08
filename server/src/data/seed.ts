import { Transaction, SecurityLog } from "../types";
import { analyzeTransaction } from "../ml/decisionEngine";
import {
  addTransaction,
  addSecurityLog,
  updateUserBalance,
  getAllTransactions,
} from "../data/store";

let seeded = false;

interface SeedEntry {
  id: string;
  logId: string;
  recipient: string;
  amount: number;
  description: string;
  automated?: boolean;
  timestamp: string;
}

const SEED_DATA: SeedEntry[] = [
  {
    id: "tx-seed-001",
    logId: "log-seed-001",
    recipient: "Almaty Electric Co.",
    amount: 15_200,
    description: "Monthly electricity bill",
    timestamp: "2026-02-07T09:15:00.000Z",
  },
  {
    id: "tx-seed-002",
    logId: "log-seed-002",
    recipient: "KazTelecom",
    amount: 8_500,
    description: "Internet subscription",
    timestamp: "2026-02-06T14:30:00.000Z",
  },
  {
    id: "tx-seed-003",
    logId: "log-seed-003",
    recipient: "Nazarbayev University",
    amount: 450_000,
    description: "Tuition fee installment",
    timestamp: "2026-02-05T11:00:00.000Z",
  },
  {
    id: "tx-seed-004",
    logId: "log-seed-004",
    recipient: "Glovo KZ",
    amount: 4_200,
    description: "Food delivery",
    timestamp: "2026-02-07T19:45:00.000Z",
  },
  {
    id: "tx-seed-005",
    logId: "log-seed-005",
    recipient: "Kaspi Магазин",
    amount: 32_000,
    description: "Electronics purchase",
    timestamp: "2026-02-04T16:20:00.000Z",
  },
  // Suspicious transactions (will trigger ML detection)
  {
    id: "tx-seed-006",
    logId: "log-seed-006",
    recipient: "Unknown Account X-8832",
    amount: 1_200_000,
    description: "Wire transfer",
    automated: true,
    timestamp: "2026-02-08T02:10:00.000Z",
  },
  {
    id: "tx-seed-007",
    logId: "log-seed-007",
    recipient: "CryptoWallet-anon-991",
    amount: 750_000,
    description: "Urgent transfer",
    automated: true,
    timestamp: "2026-02-08T02:10:30.000Z",
  },
  {
    id: "tx-seed-008",
    logId: "log-seed-008",
    recipient: "OffshoreHoldings-334",
    amount: 950_000,
    description: "Investment transfer",
    automated: true,
    timestamp: "2026-02-08T02:11:00.000Z",
  },
];

export function seedTransactions(): void {
  if (seeded || getAllTransactions().length > 0) return;
  seeded = true;

  const userId = "user-001";

  for (const entry of SEED_DATA) {
    const { decision, shouldBlock } = analyzeTransaction({
      userId,
      recipient: entry.recipient,
      amount: entry.amount,
      automated: entry.automated,
    });

    const transaction: Transaction = {
      id: entry.id,
      userId,
      recipient: entry.recipient,
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
      details: `Transaction of ${entry.amount} KZT to ${entry.recipient} ${
        shouldBlock ? "blocked" : "allowed"
      }. Risk: ${decision.riskScore}, Threat: ${decision.threatType}`,
    };
    addSecurityLog(log);

    if (!shouldBlock) {
      updateUserBalance(userId, -entry.amount);
    }
  }
}
