import { TransactionFeatures } from "../types";
import {
  getTransactionCountInWindow,
  getUniqueRecipients,
  getRecentRecipients,
} from "../data/store";

export interface ExtractionInput {
  userId: string;
  recipient: string;
  amount: number;
  automated?: boolean;
}

const HIGH_AMOUNT_THRESHOLD = 500_000;
const FREQUENCY_WINDOW_MS = 5 * 60 * 1000;
const HIGH_FREQUENCY_COUNT = 3;

export function extractFeatures(input: ExtractionInput): TransactionFeatures {
  return {
    amountRisk: computeAmountRisk(input.amount),
    frequencyRisk: computeFrequencyRisk(input.userId),
    newRecipientRisk: computeNewRecipientRisk(input.userId, input.recipient),
    automatedBehaviorRisk: input.automated ? 0.9 : 0.0,
    repetitivePatternRisk: computeRepetitivePatternRisk(input.userId, input.recipient),
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

function computeRepetitivePatternRisk(userId: string, recipient: string): number {
  const recent = getRecentRecipients(userId, 5);
  const sameCount = recent.filter((r) => r === recipient).length;
  if (sameCount >= 3) return 0.85;
  if (sameCount >= 2) return 0.5;
  return 0.05;
}
