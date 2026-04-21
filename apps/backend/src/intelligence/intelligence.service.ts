import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntelligenceItemEntity } from './entities/intelligence-item.entity';
import { CrawledItem } from '../ingestion/entities/crawled-item.entity';
import { NormalizerService } from './normalizer.service';
import { EnrichmentService } from './enrichment.service';
import { ScoringService } from './scoring.service';
import { OpenSearchService } from './opensearch.service';
import { SearchIntelligenceDto } from './dto/search-intelligence.dto';
import { PaginatedResponse } from '@sentinel/types';

@Injectable()
export class IntelligenceService {
  private readonly logger = new Logger(IntelligenceService.name);

  constructor(
    @InjectRepository(IntelligenceItemEntity)
    private readonly itemRepo: Repository<IntelligenceItemEntity>,
    private readonly normalizer: NormalizerService,
    private readonly enrichment: EnrichmentService,
    private readonly scoring: ScoringService,
    private readonly opensearch: OpenSearchService,
  ) {}

  async processRawItem(raw: CrawledItem): Promise<IntelligenceItemEntity> {
    const existing = await this.itemRepo.findOne({
      where: { fingerprint: raw.fingerprint },
    });
    if (existing) {
      this.logger.debug(`Item with fingerprint ${raw.fingerprint} already exists`);
      return existing;
    }

    let partial = this.normalizer.normalize(raw);
    partial = this.scoring.score(partial);
    partial = await this.enrichment.enrich(partial);

    const entity = this.itemRepo.create(partial as IntelligenceItemEntity);
    const saved = await this.itemRepo.save(entity);

    try {
      await this.opensearch.ensureIndex();
      await this.opensearch.indexItem(saved);
    } catch (err) {
      this.logger.warn(`Failed to index item in OpenSearch: ${err instanceof Error ? err.message : String(err)}`);
    }

    return saved;
  }

  async search(
    dto: SearchIntelligenceDto,
    tenantId: string,
  ): Promise<PaginatedResponse<IntelligenceItemEntity>> {
    try {
      return await this.opensearch.search(dto, tenantId);
    } catch (err) {
      this.logger.warn(`OpenSearch search failed, falling back to DB: ${err instanceof Error ? err.message : String(err)}`);
      return this.dbSearch(dto, tenantId);
    }
  }

  private async dbSearch(
    dto: SearchIntelligenceDto,
    tenantId: string,
  ): Promise<PaginatedResponse<IntelligenceItemEntity>> {
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 20;

    const qb = this.itemRepo
      .createQueryBuilder('item')
      .where('item.tenantId = :tenantId', { tenantId })
      .orderBy('item.publishDate', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (dto.keyword) {
      qb.andWhere('(item.title LIKE :kw OR item.summary LIKE :kw)', {
        kw: `%${dto.keyword}%`,
      });
    }

    if (dto.sourceTypes?.length) {
      qb.andWhere('item.sourceType IN (:...sourceTypes)', { sourceTypes: dto.sourceTypes });
    }

    if (dto.riskLevels?.length) {
      qb.andWhere('item.riskLevel IN (:...riskLevels)', { riskLevels: dto.riskLevels });
    }

    if (dto.dateFrom) {
      qb.andWhere('item.publishDate >= :dateFrom', { dateFrom: dto.dateFrom });
    }

    if (dto.dateTo) {
      qb.andWhere('item.publishDate <= :dateTo', { dateTo: dto.dateTo });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, tenantId: string): Promise<IntelligenceItemEntity> {
    const item = await this.itemRepo.findOne({ where: { id, tenantId } });
    if (!item) {
      throw new NotFoundException(`Intelligence item ${id} not found`);
    }
    return item;
  }

  async list(
    tenantId: string,
    page = 1,
    pageSize = 20,
  ): Promise<PaginatedResponse<IntelligenceItemEntity>> {
    const [data, total] = await this.itemRepo.findAndCount({
      where: { tenantId },
      order: { publishDate: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
