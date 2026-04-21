import { SourceType } from '@sentinel/types';

export interface CrawledItemDto {
  sourceId: string;
  tenantId: string;
  sourceType: SourceType;
  title: string;
  url: string;
  publishDate: string;
  rawContent: string;
  summary?: string;
  fingerprint: string;
  contentHash: string;
  metadata?: Record<string, unknown>;
}
