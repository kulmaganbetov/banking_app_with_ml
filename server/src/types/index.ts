// ─── Account ───
export type AccountType = "checking" | "savings";

export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  label: string;
  balance: number;
  accountNumber: string;
  dailyLimit: number;
  dailySpent: number;
  accountLimit: number;
}

// ─── User ───
export interface User {
  id: string;
  username: string;
  fullName: string;
  accountIds: string[];
}

// ─── Transaction ───
export type TransferType = "internal" | "external";

export interface Transaction {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId?: string;
  recipient: string;
  transferType: TransferType;
  amount: number;
  currency: string;
  status: "COMPLETED" | "BLOCKED";
  timestamp: string;
  description?: string;
  mlDecision?: MLDecision;
}

// ─── ML Decision ───
export type BlockCategory = "ai-behavioral" | "rule-based";

export interface BlockReason {
  category: BlockCategory;
  code: string;
  label: string;
  description: string;
}

export interface MLDecision {
  riskScore: number;
  label: "benign" | "suspicious";
  confidence: number;
  threatType: string;
  actionTaken: string;
  features: TransactionFeatures;
  blockReasons: BlockReason[];
}

export interface TransactionFeatures {
  amountRisk: number;
  frequencyRisk: number;
  newRecipientRisk: number;
  automatedBehaviorRisk: number;
  repetitivePatternRisk: number;
}

// ─── Security ───
export interface SecurityLog {
  id: string;
  timestamp: string;
  transactionId: string;
  threatType: string;
  riskScore: number;
  confidence: number;
  label: string;
  actionTaken: string;
  details: string;
  blockReasons: BlockReason[];
}

export interface SecurityStatus {
  overallThreatLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  totalTransactions: number;
  blockedTransactions: number;
  safeTransactions: number;
  recentThreats: number;
  lastScanTime: string;
  blocksByCategory: { ai: number; rule: number };
}

// ─── Requests ───
export interface CreateTransactionRequest {
  fromAccountId: string;
  toAccountId?: string;
  transferType: TransferType;
  recipient: string;
  amount: number;
  description?: string;
  automated?: boolean;
  deviceId?: string;
}
