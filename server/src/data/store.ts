import { User, Transaction, SecurityLog } from "../types";

const users: Map<string, User> = new Map();
const transactions: Transaction[] = [];
const securityLogs: SecurityLog[] = [];
const tokens: Map<string, string> = new Map(); // token -> userId

// Seed a default user
users.set("user-001", {
  id: "user-001",
  username: "demo",
  fullName: "Alikhan Nurmaganbetov",
  balance: 2_750_000,
  accountNumber: "KZ42 1234 5678 9012 3456",
});

export function getUser(id: string): User | undefined {
  return users.get(id);
}

export function getUserByUsername(username: string): User | undefined {
  for (const user of users.values()) {
    if (user.username === username) return user;
  }
  return undefined;
}

export function updateUserBalance(userId: string, amount: number): void {
  const user = users.get(userId);
  if (user) {
    user.balance += amount;
  }
}

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

export function addSecurityLog(log: SecurityLog): void {
  securityLogs.push(log);
}

export function getSecurityLogs(): SecurityLog[] {
  return [...securityLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function setToken(token: string, userId: string): void {
  tokens.set(token, userId);
}

export function getUserIdByToken(token: string): string | undefined {
  return tokens.get(token);
}

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
