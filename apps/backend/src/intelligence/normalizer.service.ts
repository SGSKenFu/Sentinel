import { Injectable, Logger } from '@nestjs/common';
import { CrawledItem } from '../ingestion/entities/crawled-item.entity';
import { IntelligenceItemEntity } from './entities/intelligence-item.entity';
import { ProcessingChainEntry, RiskLevel } from '@sentinel/types';
import { NormalizerBase } from '@sentinel/sdk';

@Injectable()
export class NormalizerService extends NormalizerBase {
  private readonly logger = new Logger(NormalizerService.name);

  normalize(raw: CrawledItem): Partial<IntelligenceItemEntity> {
    const chain: ProcessingChainEntry[] = [
      {
        stage: 'normalize',
        timestamp: new Date().toISOString(),
        status: 'success',
        details: `Normalized from source ${raw.sourceId}`,
      },
    ];

    return {
      tenantId: raw.tenantId,
      sourceType: raw.sourceType,
      title: this.cleanText(raw.title),
      url: raw.url,
      publishDate: raw.publishDate,
      summary: this.cleanText(raw.rawContent).substring(0, 500),
      tags: this.extractTags(raw.rawContent),
      riskLevel: RiskLevel.INFO,
      fingerprint: raw.fingerprint,
      contentHash: raw.contentHash,
      rawDataId: raw.id,
      processingChain: chain,
    };
  }
}
