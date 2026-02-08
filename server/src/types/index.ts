export interface User {
  id: string;
  username: string;
  fullName: string;
  balance: number;
  accountNumber: string;
}

export interface Transaction {
  id: string;
  userId: string;
  recipient: string;
  amount: number;
  currency: string;
  status: "COMPLETED" | "BLOCKED";
  timestamp: string;
  description?: string;
  mlDecision?: MLDecision;
}

export interface MLDecision {
  riskScore: number;
  label: "benign" | "ransomware-like";
  confidence: number;
  threatType: string;
  actionTaken: string;
  features: TransactionFeatures;
}

export interface TransactionFeatures {
  amountRisk: number;
  frequencyRisk: number;
  newRecipientRisk: number;
  automatedBehaviorRisk: number;
}

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
}

export interface SecurityStatus {
  overallThreatLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  totalTransactions: number;
  blockedTransactions: number;
  safeTransactions: number;
  recentThreats: number;
  lastScanTime: string;
}

export interface AuthToken {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface CreateTransactionRequest {
  recipient: string;
  amount: number;
  description?: string;
  automated?: boolean;
}
