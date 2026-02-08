import { MLDecision, TransactionFeatures, BlockReason, Account } from "../types";
import { extractFeatures } from "./featureExtractor";
import { predict, getThreshold } from "./modelMock";
import { checkRules } from "./ruleChecker";

interface AnalysisInput {
  userId: string;
  recipient: string;
  amount: number;
  automated?: boolean;
  account: Account;
  timestamp: string;
  deviceId?: string;
}

export interface AnalysisResult {
  decision: MLDecision;
  shouldBlock: boolean;
}

export function analyzeTransaction(input: AnalysisInput): AnalysisResult {
  // Step 1: AI-based behavioral analysis
  const features: TransactionFeatures = extractFeatures({
    userId: input.userId,
    recipient: input.recipient,
    amount: input.amount,
    automated: input.automated,
  });

  const prediction = predict({ features });

  // Step 2: Rule-based banking checks
  const ruleReasons = checkRules({
    account: input.account,
    amount: input.amount,
    timestamp: input.timestamp,
    deviceId: input.deviceId,
  });

  // Step 3: Combine block reasons
  const allReasons: BlockReason[] = [...prediction.aiReasons, ...ruleReasons];
  const aiTriggered = prediction.riskScore > getThreshold();
  const ruleTriggered = ruleReasons.length > 0;
  const shouldBlock = aiTriggered || ruleTriggered;
  const actionTaken = shouldBlock ? "BLOCKED" : "ALLOWED";

  // Determine primary threat type
  let threatType = prediction.threatType;
  if (!aiTriggered && ruleTriggered) {
    threatType = ruleReasons[0].code.toLowerCase().replace(/_/g, "-");
  }

  const decision: MLDecision = {
    riskScore: Math.round(prediction.riskScore * 1000) / 1000,
    label: shouldBlock ? "suspicious" : "benign",
    confidence: Math.round(prediction.confidence * 1000) / 1000,
    threatType,
    actionTaken,
    features,
    blockReasons: shouldBlock ? allReasons : [],
  };

  return { decision, shouldBlock };
}
