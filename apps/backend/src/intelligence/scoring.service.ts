import { Injectable, Logger } from '@nestjs/common';
import { IntelligenceItemEntity } from './entities/intelligence-item.entity';
import { RiskLevel, SourceType } from '@sentinel/types';
import { ProcessingChainEntry } from '@sentinel/types';

interface ScoringRule {
  keywords: string[];
  riskLevel: RiskLevel;
  weight: number;
}

const HIGH_RISK_KEYWORDS = [
  'mandatory recall', 'forced recall', 'safety ban', 'prohibited', 'enforcement',
  'serious risk', 'death', 'injury', 'fatality', 'hazard', 'dangerous',
  'immediate', 'urgent', 'emergency', 'violation', 'penalty', 'fine',
  'suspension', 'revocation', 'seizure', 'injunction',
];

const MEDIUM_RISK_KEYWORDS = [
  'recall', 'warning', 'caution', 'amendment', 'revision', 'update',
  'new requirement', 'deadline', 'compliance', 'mandatory', 'required',
  'effective date', 'implementation', 'transition period',
];

const LOW_RISK_KEYWORDS = [
  'proposal', 'consultation', 'draft', 'guidance', 'recommendation',
  'voluntary', 'best practice', 'review', 'study', 'report', 'survey',
];

const SCORING_RULES: ScoringRule[] = [
  { keywords: HIGH_RISK_KEYWORDS, riskLevel: RiskLevel.HIGH, weight: 3 },
  { keywords: MEDIUM_RISK_KEYWORDS, riskLevel: RiskLevel.MEDIUM, weight: 2 },
  { keywords: LOW_RISK_KEYWORDS, riskLevel: RiskLevel.LOW, weight: 1 },
];

const SOURCE_TYPE_BASE_RISK: Record<SourceType, RiskLevel> = {
  [SourceType.RECALL]: RiskLevel.HIGH,
  [SourceType.REGULATION]: RiskLevel.MEDIUM,
  [SourceType.STANDARD]: RiskLevel.LOW,
  [SourceType.DOMESTIC]: RiskLevel.MEDIUM,
};

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  score(item: Partial<IntelligenceItemEntity>): Partial<IntelligenceItemEntity> {
    const text = `${item.title ?? ''} ${item.summary ?? ''}`.toLowerCase();
    const sourceType = item.sourceType ?? SourceType.REGULATION;

    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (const rule of SCORING_RULES) {
      for (const keyword of rule.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          if (rule.riskLevel === RiskLevel.HIGH) highCount += rule.weight;
          else if (rule.riskLevel === RiskLevel.MEDIUM) mediumCount += rule.weight;
          else lowCount += rule.weight;
        }
      }
    }

    let riskLevel: RiskLevel;

    if (highCount >= 2) {
      riskLevel = RiskLevel.HIGH;
    } else if (highCount >= 1 || mediumCount >= 3) {
      riskLevel = RiskLevel.MEDIUM;
    } else if (mediumCount >= 1 || lowCount >= 2) {
      riskLevel = RiskLevel.LOW;
    } else {
      riskLevel = SOURCE_TYPE_BASE_RISK[sourceType] ?? RiskLevel.INFO;
    }

    const chainEntry: ProcessingChainEntry = {
      stage: 'scoring',
      timestamp: new Date().toISOString(),
      status: 'success',
      details: `Keyword scoring: high=${highCount}, medium=${mediumCount}, low=${lowCount} → ${riskLevel}`,
    };

    return {
      ...item,
      riskLevel,
      processingChain: [...(item.processingChain ?? []), chainEntry],
    };
  }
}
