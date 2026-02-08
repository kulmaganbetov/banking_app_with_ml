import { User, Account, Transaction, SecurityLog } from "../types";

const users: Map<string, User> = new Map();
const accounts: Map<string, Account> = new Map();
const transactions: Transaction[] = [];
const securityLogs: SecurityLog[] = [];

// Token encoding/decoding — self-contained tokens for serverless compatibility
const TOKEN_PREFIX = "sb_";

export function encodeToken(userId: string): string {
  const payload = JSON.stringify({ uid: userId, ts: Date.now() });
  return TOKEN_PREFIX + Buffer.from(payload).toString("base64url");
}

export function decodeToken(token: string): string | null {
  if (!token.startsWith(TOKEN_PREFIX)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.slice(TOKEN_PREFIX.length), "base64url").toString()
    );
    return payload.uid || null;
  } catch {
    return null;
  }
}

// ─── Seed default user with two accounts ───
users.set("user-001", {
  id: "user-001",
  username: "demo",
  fullName: "Alikhan Nurmaganbetov",
  accountIds: ["acc-checking-001", "acc-savings-001"],
});

accounts.set("acc-checking-001", {
  id: "acc-checking-001",
  userId: "user-001",
  type: "checking",
  label: "Primary Checking",
  balance: 2_750_000,
  accountNumber: "KZ42 1234 5678 9012 3456",
  dailyLimit: 2_000_000,
  dailySpent: 0,
  accountLimit: 5_000_000,
});

accounts.set("acc-savings-001", {
  id: "acc-savings-001",
  userId: "user-001",
  type: "savings",
  label: "Savings",
  balance: 8_420_000,
  accountNumber: "KZ42 1234 5678 9012 7890",
  dailyLimit: 1_000_000,
  dailySpent: 0,
  accountLimit: 15_000_000,
});

// ─── User ops ───
export function getUser(id: string): User | undefined {
  return users.get(id);
}

export function getUserByUsername(username: string): User | undefined {
  for (const user of users.values()) {
    if (user.username === username) return user;
  }
  return undefined;
}

// ─── Account ops ───
export function getAccount(id: string): Account | undefined {
  return accounts.get(id);
}

export function getUserAccounts(userId: string): Account[] {
  const user = users.get(userId);
  if (!user) return [];
  return user.accountIds.map((id) => accounts.get(id)!).filter(Boolean);
}

export function updateAccountBalance(accountId: string, delta: number): void {
  const acc = accounts.get(accountId);
  if (acc) acc.balance += delta;
}

export function addDailySpent(accountId: string, amount: number): void {
  const acc = accounts.get(accountId);
  if (acc) acc.dailySpent += amount;
}

// ─── Transaction ops ───
export function addTransaction(tx: Transaction): void {
  transactions.push(tx);
}

export function getTransactions(userId: string): Transaction[] {
  return transactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getAllTransactions(): Transaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ─── Security ops ───
export function addSecurityLog(log: SecurityLog): void {
  securityLogs.push(log);
}

export function getSecurityLogs(): SecurityLog[] {
  return [...securityLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ─── Analytics helpers ───
export function getTransactionCountInWindow(userId: string, windowMs: number): number {
  const now = Date.now();
  return transactions.filter(
    (t) => t.userId === userId && now - new Date(t.timestamp).getTime() < windowMs
  ).length;
}

export function getUniqueRecipients(userId: string): Set<string> {
  const recipients = new Set<string>();
  for (const tx of transactions) {
    if (tx.userId === userId && tx.status === "COMPLETED") {
      recipients.add(tx.recipient);
    }
  }
  return recipients;
}

export function getRecentRecipients(userId: string, count: number): string[] {
  return transactions
    .filter((t) => t.userId === userId && t.status === "COMPLETED")
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, count)
    .map((t) => t.recipient);
}
