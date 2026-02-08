import { TransactionFeatures, MLDecision } from "../types";
import { computeRiskScore, computeConfidence } from "./riskScorer";

const RISK_THRESHOLD = 0.55;

interface ModelInput {
  features: TransactionFeatures;
}

interface ModelOutput {
  riskScore: number;
  label: "benign" | "ransomware-like";
  confidence: number;
  threatType: string;
}

export function predict(input: ModelInput): ModelOutput {
  const { features } = input;
  const riskScore = computeRiskScore(features);
  const confidence = computeConfidence(features);
  const label: "benign" | "ransomware-like" =
    riskScore > RISK_THRESHOLD ? "ransomware-like" : "benign";

  const threatType = classifyThreat(features, riskScore);

  return { riskScore, label, confidence, threatType };
}

function classifyThreat(features: TransactionFeatures, riskScore: number): string {
  if (riskScore <= RISK_THRESHOLD) return "none";

  if (features.automatedBehaviorRisk > 0.7 && features.frequencyRisk > 0.5) {
    return "automated-ransomware-pattern";
  }
  if (features.amountRisk > 0.8 && features.newRecipientRisk > 0.3) {
    return "high-value-suspicious-transfer";
  }
  if (features.frequencyRisk > 0.7) {
    return "rapid-fire-exfiltration";
  }
  if (features.amountRisk > 0.5) {
    return "unusual-amount-pattern";
  }
  return "general-suspicious-activity";
}

export function getThreshold(): number {
  return RISK_THRESHOLD;
}
