import { TransactionFeatures } from "../types";

const FEATURE_WEIGHTS = {
  amountRisk: 0.25,
  frequencyRisk: 0.25,
  newRecipientRisk: 0.15,
  automatedBehaviorRisk: 0.20,
  repetitivePatternRisk: 0.15,
};

export function computeRiskScore(features: TransactionFeatures): number {
  const weighted =
    features.amountRisk * FEATURE_WEIGHTS.amountRisk +
    features.frequencyRisk * FEATURE_WEIGHTS.frequencyRisk +
    features.newRecipientRisk * FEATURE_WEIGHTS.newRecipientRisk +
    features.automatedBehaviorRisk * FEATURE_WEIGHTS.automatedBehaviorRisk +
    features.repetitivePatternRisk * FEATURE_WEIGHTS.repetitivePatternRisk;

  return Math.min(1, Math.max(0, weighted));
}

export function computeConfidence(features: TransactionFeatures): number {
  const score = computeRiskScore(features);
  const values = Object.values(features);
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - score, 2), 0) / values.length;

  return Math.min(1, Math.max(0.5, 1 - variance));
}
