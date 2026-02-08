import { TransactionFeatures } from "../types";
import { getTransactionCountInWindow, getUniqueRecipients } from "../data/store";

interface ExtractionInput {
  userId: string;
  recipient: string;
  amount: number;
  automated?: boolean;
}

const HIGH_AMOUNT_THRESHOLD = 500_000; // KZT
const FREQUENCY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const HIGH_FREQUENCY_COUNT = 3;

export function extractFeatures(input: ExtractionInput): TransactionFeatures {
  const amountRisk = computeAmountRisk(input.amount);
  const frequencyRisk = computeFrequencyRisk(input.userId);
  const newRecipientRisk = computeNewRecipientRisk(input.userId, input.recipient);
  const automatedBehaviorRisk = input.automated ? 0.9 : 0.0;

  return {
    amountRisk,
    frequencyRisk,
    newRecipientRisk,
    automatedBehaviorRisk,
  };
}

function computeAmountRisk(amount: number): number {
  if (amount >= 1_000_000) return 0.95;
  if (amount >= HIGH_AMOUNT_THRESHOLD) return 0.6;
  if (amount >= 200_000) return 0.3;
  return 0.1;
}

function computeFrequencyRisk(userId: string): number {
  const recentCount = getTransactionCountInWindow(userId, FREQUENCY_WINDOW_MS);
  if (recentCount >= HIGH_FREQUENCY_COUNT * 2) return 0.95;
  if (recentCount >= HIGH_FREQUENCY_COUNT) return 0.7;
  if (recentCount >= 2) return 0.3;
  return 0.05;
}

function computeNewRecipientRisk(userId: string, recipient: string): number {
  const knownRecipients = getUniqueRecipients(userId);
  return knownRecipients.has(recipient) ? 0.05 : 0.5;
}
