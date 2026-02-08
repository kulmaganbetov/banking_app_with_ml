import { v4 as uuidv4 } from "uuid";
import { Transaction, SecurityLog, CreateTransactionRequest } from "../types";
import { analyzeTransaction } from "../ml/decisionEngine";
import {
  addTransaction,
  getTransactions,
  updateUserBalance,
  addSecurityLog,
  getUser,
  getSecurityLogs,
  getAllTransactions,
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
  const { decision, shouldBlock } = analyzeTransaction({
    userId,
    recipient: request.recipient,
    amount: request.amount,
    automated: request.automated,
  });

  const transaction: Transaction = {
    id: uuidv4(),
    userId,
    recipient: request.recipient,
    amount: request.amount,
    currency: "KZT",
    status: shouldBlock ? "BLOCKED" : "COMPLETED",
    timestamp: new Date().toISOString(),
    description: request.description,
    mlDecision: decision,
  };

  addTransaction(transaction);

  if (shouldBlock) {
    const log: SecurityLog = {
      id: uuidv4(),
      timestamp: transaction.timestamp,
      transactionId: transaction.id,
      threatType: decision.threatType,
      riskScore: decision.riskScore,
      confidence: decision.confidence,
      label: decision.label,
      actionTaken: "BLOCKED",
      details: `Transaction of ${request.amount} KZT to ${request.recipient} blocked. Risk: ${decision.riskScore}, Threat: ${decision.threatType}`,
    };
    addSecurityLog(log);
  } else {
    // Log benign decisions too for audit
    const log: SecurityLog = {
      id: uuidv4(),
      timestamp: transaction.timestamp,
      transactionId: transaction.id,
      threatType: decision.threatType,
      riskScore: decision.riskScore,
      confidence: decision.confidence,
      label: decision.label,
      actionTaken: "ALLOWED",
      details: `Transaction of ${request.amount} KZT to ${request.recipient} allowed. Risk: ${decision.riskScore}`,
    };
    addSecurityLog(log);
    updateUserBalance(userId, -request.amount);
  }

  return {
    transaction,
    blocked: shouldBlock,
    warning: shouldBlock
      ? `Transaction blocked by AI security. Threat: ${decision.threatType} (confidence: ${(decision.confidence * 100).toFixed(1)}%)`
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
      l.label === "ransomware-like" &&
      new Date(l.timestamp).getTime() > oneHourAgo
  ).length;

  let overallThreatLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
  if (recentThreats >= 5) overallThreatLevel = "CRITICAL";
  else if (recentThreats >= 3) overallThreatLevel = "HIGH";
  else if (recentThreats >= 1) overallThreatLevel = "MEDIUM";

  return {
    overallThreatLevel,
    totalTransactions: allTx.length,
    blockedTransactions: blockedCount,
    safeTransactions: safeCount,
    recentThreats,
    lastScanTime: new Date().toISOString(),
  };
}

export function fetchSecurityLogs() {
  return getSecurityLogs();
}
