import { BlockReason, Account } from "../types";

interface RuleCheckInput {
  account: Account;
  amount: number;
  timestamp: string;
  deviceId?: string;
}

const KNOWN_DEVICE = "device-main-001";

export function checkRules(input: RuleCheckInput): BlockReason[] {
  const reasons: BlockReason[] = [];

  // Rule 1: Daily limit exceeded
  if (input.account.dailySpent + input.amount > input.account.dailyLimit) {
    reasons.push({
      category: "rule-based",
      code: "DAILY_LIMIT_EXCEEDED",
      label: "Exceeded Daily Limit",
      description: `Daily limit of ${fmt(input.account.dailyLimit)} KZT would be exceeded. Current spent: ${fmt(input.account.dailySpent)} KZT`,
    });
  }

  // Rule 2: Account limit exceeded
  if (input.amount > input.account.accountLimit) {
    reasons.push({
      category: "rule-based",
      code: "ACCOUNT_LIMIT_EXCEEDED",
      label: "Exceeded Account Limit",
      description: `Single transaction limit of ${fmt(input.account.accountLimit)} KZT exceeded`,
    });
  }

  // Rule 3: Suspicious time (00:00 – 05:59 local time, approx UTC+6 for KZ)
  const hour = new Date(input.timestamp).getUTCHours() + 6; // approximate KZ time
  const kzHour = hour >= 24 ? hour - 24 : hour;
  if (kzHour >= 0 && kzHour < 6) {
    reasons.push({
      category: "rule-based",
      code: "SUSPICIOUS_TIME",
      label: "Suspicious Time",
      description: `Transaction initiated during unusual hours (${String(kzHour).padStart(2, "0")}:00 local time)`,
    });
  }

  // Rule 4: New device detected
  if (input.deviceId && input.deviceId !== KNOWN_DEVICE) {
    reasons.push({
      category: "rule-based",
      code: "NEW_DEVICE",
      label: "New Device Detected",
      description: `Transaction initiated from an unrecognized device (${input.deviceId})`,
    });
  }

  // Rule 5: Savings account restrictions — higher scrutiny
  if (input.account.type === "savings" && input.amount > input.account.dailyLimit * 0.5) {
    reasons.push({
      category: "rule-based",
      code: "SAVINGS_HIGH_WITHDRAWAL",
      label: "Large Savings Withdrawal",
      description: `Withdrawal of ${fmt(input.amount)} KZT exceeds 50% of savings daily limit`,
    });
  }

  return reasons;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}
