import { MLDecision, TransactionFeatures } from "../types";
import { extractFeatures } from "./featureExtractor";
import { predict, getThreshold } from "./modelMock";

interface AnalysisInput {
  userId: string;
  recipient: string;
  amount: number;
  automated?: boolean;
}

export interface AnalysisResult {
  decision: MLDecision;
  shouldBlock: boolean;
}

export function analyzeTransaction(input: AnalysisInput): AnalysisResult {
  const features: TransactionFeatures = extractFeatures({
    userId: input.userId,
    recipient: input.recipient,
    amount: input.amount,
    automated: input.automated,
  });

  const prediction = predict({ features });
  const shouldBlock = prediction.riskScore > getThreshold();
  const actionTaken = shouldBlock ? "BLOCKED" : "ALLOWED";

  const decision: MLDecision = {
    riskScore: Math.round(prediction.riskScore * 1000) / 1000,
    label: prediction.label,
    confidence: Math.round(prediction.confidence * 1000) / 1000,
    threatType: prediction.threatType,
    actionTaken,
    features,
  };

  return { decision, shouldBlock };
}
