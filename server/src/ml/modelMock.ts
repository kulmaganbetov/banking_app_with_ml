import { TransactionFeatures, BlockReason } from "../types";
import { computeRiskScore, computeConfidence } from "./riskScorer";

const RISK_THRESHOLD = 0.55;

interface ModelInput {
  features: TransactionFeatures;
}

interface ModelOutput {
  riskScore: number;
  label: "benign" | "suspicious";
  confidence: number;
  threatType: string;
  aiReasons: BlockReason[];
}

export function predict(input: ModelInput): ModelOutput {
  const { features } = input;
  const riskScore = computeRiskScore(features);
  const confidence = computeConfidence(features);
  const label: "benign" | "suspicious" =
    riskScore > RISK_THRESHOLD ? "suspicious" : "benign";

  const threatType = classifyThreat(features, riskScore);
  const aiReasons = collectAIReasons(features);

  return { riskScore, label, confidence, threatType, aiReasons };
}

function classifyThreat(features: TransactionFeatures, riskScore: number): string {
  if (riskScore <= RISK_THRESHOLD) return "none";

  if (features.automatedBehaviorRisk > 0.7 && features.frequencyRisk > 0.5) {
    return "automated-ransomware-pattern";
  }
  if (features.repetitivePatternRisk > 0.7) {
    return "repetitive-actions-pattern";
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

function collectAIReasons(features: TransactionFeatures): BlockReason[] {
  const reasons: BlockReason[] = [];

  if (features.automatedBehaviorRisk > 0.7) {
    reasons.push({
      category: "ai-behavioral",
      code: "AUTOMATED_BEHAVIOR",
      label: "Automated Transaction Behavior",
      description: "Transaction appears to be initiated by automated software, not a human user",
    });
  }
  if (features.frequencyRisk > 0.5) {
    reasons.push({
      category: "ai-behavioral",
      code: "UNUSUAL_FREQUENCY",
      label: "Unusual Transaction Frequency",
      description: "Multiple transactions detected in a short time window — potential burst attack",
    });
  }
  if (features.amountRisk > 0.5) {
    reasons.push({
      category: "ai-behavioral",
      code: "SUDDEN_HIGH_VALUE",
      label: "Sudden High-Value Transfer",
      description: "Transaction amount significantly exceeds normal spending patterns",
    });
  }
  if (features.repetitivePatternRisk > 0.4) {
    reasons.push({
      category: "ai-behavioral",
      code: "REPETITIVE_PATTERN",
      label: "Repetitive Actions Pattern",
      description: "Same recipient targeted repeatedly in a short period — possible automated drain",
    });
  }
  if (features.newRecipientRisk > 0.3) {
    reasons.push({
      category: "ai-behavioral",
      code: "NEW_RECIPIENT",
      label: "Unknown Recipient",
      description: "First-time recipient combined with other risk factors",
    });
  }

  return reasons;
}

export function getThreshold(): number {
  return RISK_THRESHOLD;
}
