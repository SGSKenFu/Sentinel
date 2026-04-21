import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';
import { OPENSEARCH_CLIENT } from '../config/opensearch.config';
import { IntelligenceItemEntity } from './entities/intelligence-item.entity';
import { SearchIntelligenceDto } from './dto/search-intelligence.dto';
import { PaginatedResponse } from '@sentinel/types';

const INDEX_NAME_DEFAULT = 'sentinel-intelligence';

interface OsHit {
  _id: string;
  _source: IntelligenceItemEntity;
}

interface OsSearchResponse {
  hits: {
    total: { value: number };
    hits: OsHit[];
  };
}

@Injectable()
export class OpenSearchService {
  private readonly logger = new Logger(OpenSearchService.name);
  private readonly indexName: string;

  constructor(
    @Inject(OPENSEARCH_CLIENT) private readonly client: Client,
    private readonly configService: ConfigService,
  ) {
    this.indexName = configService.get<string>('OPENSEARCH_INDEX_INTELLIGENCE', INDEX_NAME_DEFAULT);
  }

  async ensureIndex(): Promise<void> {
    const exists = await this.client.indices.exists({ index: this.indexName });
    if (exists.body) return;

    await this.client.indices.create({
      index: this.indexName,
      body: {
        settings: { number_of_shards: 1, number_of_replicas: 0 },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            tenantId: { type: 'keyword' },
            sourceType: { type: 'keyword' },
            title: { type: 'text', analyzer: 'standard' },
            url: { type: 'keyword' },
            publishDate: { type: 'date' },
            summary: { type: 'text', analyzer: 'standard' },
            tags: { type: 'keyword' },
            riskLevel: { type: 'keyword' },
            fingerprint: { type: 'keyword' },
            contentHash: { type: 'keyword' },
            enrichedAt: { type: 'date' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
          },
        },
      },
    });

    this.logger.log(`Created OpenSearch index: ${this.indexName}`);
  }

  async indexItem(item: IntelligenceItemEntity): Promise<void> {
    await this.client.index({
      index: this.indexName,
      id: item.id,
      body: item,
      refresh: 'wait_for',
    });
  }

  async search(
    dto: SearchIntelligenceDto,
    tenantId: string,
  ): Promise<PaginatedResponse<IntelligenceItemEntity>> {
    const { keyword, sourceTypes, riskLevels, dateFrom, dateTo, tags, page = 1, pageSize = 20 } = dto;

    const must: unknown[] = [{ term: { tenantId } }];
    const filter: unknown[] = [];

    if (keyword) {
      must.push({
        multi_match: {
          query: keyword,
          fields: ['title^3', 'summary^2', 'tags'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    if (sourceTypes && sourceTypes.length > 0) {
      filter.push({ terms: { sourceType: sourceTypes } });
    }

    if (riskLevels && riskLevels.length > 0) {
      filter.push({ terms: { riskLevel: riskLevels } });
    }

    if (tags && tags.length > 0) {
      filter.push({ terms: { tags } });
    }

    if (dateFrom || dateTo) {
      const range: Record<string, string> = {};
      if (dateFrom) range['gte'] = dateFrom;
      if (dateTo) range['lte'] = dateTo;
      filter.push({ range: { publishDate: range } });
    }

    const response = await this.client.search<OsSearchResponse>({
      index: this.indexName,
      body: {
        query: { bool: { must, filter } },
        sort: [{ publishDate: 'desc' }, { riskLevel: 'desc' }],
        from: (page - 1) * pageSize,
        size: pageSize,
      },
    });

    const hits = response.body.hits;
    const total = hits.total.value;
    const data = hits.hits.map((h) => ({ ...h._source, id: h._id }));

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
