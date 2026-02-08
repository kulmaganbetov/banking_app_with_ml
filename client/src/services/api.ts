import type {
  User,
  Transaction,
  SecurityLog,
  SecurityStatus,
  TransactionResult,
} from "../types";

const API_BASE = "/api";

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function login(
  username: string,
  password: string
): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function createTransaction(data: {
  recipient: string;
  amount: number;
  description?: string;
  automated?: boolean;
}): Promise<TransactionResult> {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok && res.status !== 403) {
    throw new Error(body.error || "Transaction failed");
  }
  return body;
}

export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/transactions`, {
    headers: getHeaders(),
  });
  const body = await handleResponse<{ transactions: Transaction[] }>(res);
  return body.transactions;
}

export async function getSecurityLogs(): Promise<SecurityLog[]> {
  const res = await fetch(`${API_BASE}/security/logs`, {
    headers: getHeaders(),
  });
  const body = await handleResponse<{ logs: SecurityLog[] }>(res);
  return body.logs;
}

export async function getSecurityStatus(): Promise<SecurityStatus> {
  const res = await fetch(`${API_BASE}/security/status`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}
