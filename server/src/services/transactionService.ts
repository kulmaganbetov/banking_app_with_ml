import { v4 as uuidv4 } from "uuid";
import { Transaction, SecurityLog, CreateTransactionRequest } from "../types";
import { analyzeTransaction } from "../ml/decisionEngine";
import {
  addTransaction,
  getTransactions,
  updateAccountBalance,
  addDailySpent,
  addSecurityLog,
  getAccount,
  getSecurityLogs,
} from "../data/store";

interface TransactionResult {
  transaction: Transaction;
  blocked: boolean;
  warning?: string;
}

export function createTransaction(
  userId: string,
  request: CreateTransactionRequest
): TransactionResult {
  const account = getAccount(request.fromAccountId);
  if (!account) throw new Error("Source account not found");

  const timestamp = new Date().toISOString();

  const { decision, shouldBlock } = analyzeTransaction({
    userId,
    recipient: request.recipient,
    amount: request.amount,
    automated: request.automated,
    account,
    timestamp,
    deviceId: request.deviceId,
  });

  const transaction: Transaction = {
    id: uuidv4(),
    userId,
    fromAccountId: request.fromAccountId,
    toAccountId: request.toAccountId,
    recipient: request.recipient,
    transferType: request.transferType,
    amount: request.amount,
    currency: "KZT",
    status: shouldBlock ? "BLOCKED" : "COMPLETED",
    timestamp,
    description: request.description,
    mlDecision: decision,
  };

  addTransaction(transaction);

  const log: SecurityLog = {
    id: uuidv4(),
    timestamp,
    transactionId: transaction.id,
    threatType: decision.threatType,
    riskScore: decision.riskScore,
    confidence: decision.confidence,
    label: decision.label,
    actionTaken: shouldBlock ? "BLOCKED" : "ALLOWED",
    details: `${request.transferType === "internal" ? "Internal" : "External"} transfer of ${request.amount} KZT to ${request.recipient} ${shouldBlock ? "blocked" : "allowed"}. Risk: ${decision.riskScore}`,
    blockReasons: decision.blockReasons,
  };
  addSecurityLog(log);

  if (!shouldBlock) {
    updateAccountBalance(request.fromAccountId, -request.amount);
    addDailySpent(request.fromAccountId, request.amount);
    if (request.transferType === "internal" && request.toAccountId) {
      updateAccountBalance(request.toAccountId, request.amount);
    }
  }

  const reasonSummary = decision.blockReasons
    .map((r) => r.label)
    .join(", ");

  return {
    transaction,
    blocked: shouldBlock,
    warning: shouldBlock
      ? `Transaction blocked. Reasons: ${reasonSummary}`
      : undefined,
  };
}

export function getUserTransactions(userId: string) {
  return getTransactions(userId);
}

export function getSecurityStatus(userId: string) {
  const allTx = getTransactions(userId);
  const logs = getSecurityLogs();
  const blockedCount = allTx.filter((t) => t.status === "BLOCKED").length;
  const safeCount = allTx.filter((t) => t.status === "COMPLETED").length;

  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentThreats = logs.filter(
    (l) =>
      l.label === "suspicious" &&
      new Date(l.timestamp).getTime() > oneHourAgo
  ).length;

  let overallThreatLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
  if (recentThreats >= 5) overallThreatLevel = "CRITICAL";
  else if (recentThreats >= 3) overallThreatLevel = "HIGH";
  else if (recentThreats >= 1) overallThreatLevel = "MEDIUM";

  const aiBlocks = logs.filter(
    (l) => l.actionTaken === "BLOCKED" && l.blockReasons.some((r) => r.category === "ai-behavioral")
  ).length;
  const ruleBlocks = logs.filter(
    (l) => l.actionTaken === "BLOCKED" && l.blockReasons.some((r) => r.category === "rule-based")
  ).length;

  return {
    overallThreatLevel,
    totalTransactions: allTx.length,
    blockedTransactions: blockedCount,
    safeTransactions: safeCount,
    recentThreats,
    lastScanTime: new Date().toISOString(),
    blocksByCategory: { ai: aiBlocks, rule: ruleBlocks },
  };
}

export function fetchSecurityLogs() {
  return getSecurityLogs();
}
