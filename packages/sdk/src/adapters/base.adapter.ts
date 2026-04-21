import { CrawledItemDto } from '../dtos/crawled-item.dto';
import { DeduplicationService } from '../deduplication/deduplication.service';

export interface AdapterConfig {
  sourceId: string;
  url: string;
  name: string;
  tenantId: string;
}

export abstract class BaseAdapter {
  protected config: AdapterConfig;

  constructor(config: AdapterConfig) {
    this.config = config;
  }

  abstract fetch(): Promise<CrawledItemDto[]>;

  get sourceName(): string {
    return this.config.name;
  }

  get sourceId(): string {
    return this.config.sourceId;
  }

  protected buildFingerprint(url: string): string {
    return DeduplicationService.fingerprintFromUrl(url);
  }

  protected buildContentHash(title: string, date: string, summary: string): string {
    return DeduplicationService.contentHash(title, date, summary);
  }
}
