import { Test, TestingModule } from '@nestjs/testing';
import { ScoringService } from './scoring.service';
import { RiskLevel, SourceType } from '@sentinel/types';
import { IntelligenceItemEntity } from './entities/intelligence-item.entity';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoringService],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should assign HIGH risk for mandatory recall content', () => {
    const item: Partial<IntelligenceItemEntity> = {
      title: 'Mandatory recall issued for dangerous product',
      summary: 'Serious risk of injury. Emergency enforcement action.',
      sourceType: SourceType.RECALL,
      processingChain: [],
    };

    const result = service.score(item);
    expect(result.riskLevel).toBe(RiskLevel.HIGH);
  });

  it('should assign INFO risk for general content', () => {
    const item: Partial<IntelligenceItemEntity> = {
      title: 'Industry overview 2024',
      summary: 'General industry news and updates.',
      sourceType: SourceType.STANDARD,
      processingChain: [],
    };

    const result = service.score(item);
    expect([RiskLevel.INFO, RiskLevel.LOW]).toContain(result.riskLevel);
  });
});
