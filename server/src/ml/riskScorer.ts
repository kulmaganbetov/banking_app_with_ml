import { TransactionFeatures } from "../types";

const FEATURE_WEIGHTS = {
  amountRisk: 0.30,
  frequencyRisk: 0.30,
  newRecipientRisk: 0.15,
  automatedBehaviorRisk: 0.25,
};

export function computeRiskScore(features: TransactionFeatures): number {
  const weighted =
    features.amountRisk * FEATURE_WEIGHTS.amountRisk +
    features.frequencyRisk * FEATURE_WEIGHTS.frequencyRisk +
    features.newRecipientRisk * FEATURE_WEIGHTS.newRecipientRisk +
    features.automatedBehaviorRisk * FEATURE_WEIGHTS.automatedBehaviorRisk;

  return Math.min(1, Math.max(0, weighted));
}

export function computeConfidence(features: TransactionFeatures): number {
  const values = Object.values(features);
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - computeRiskScore(features), 2), 0) /
    values.length;

  // Higher agreement among features → higher confidence
  return Math.min(1, Math.max(0.5, 1 - variance));
}
