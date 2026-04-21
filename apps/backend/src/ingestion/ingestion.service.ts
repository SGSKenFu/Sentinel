import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrawledItemDto, BaseAdapter } from '@sentinel/sdk';
import { CrawledItem } from './entities/crawled-item.entity';
import { IntelligenceSource } from './entities/intelligence-source.entity';
import { CreateSourceDto } from './dto/create-source.dto';
import { CpscRecallsAdapter } from './adapters/cpsc-recalls.adapter';
import { EuSafetyGateAdapter } from './adapters/eu-safety-gate.adapter';
import { FederalRegisterAdapter } from './adapters/federal-register.adapter';
import { EurLexAdapter } from './adapters/eur-lex.adapter';
import { IsoStandardsAdapter } from './adapters/iso-standards.adapter';
import { IecWebstoreAdapter } from './adapters/iec-webstore.adapter';
import { SamrChinaAdapter } from './adapters/samr-china.adapter';
import { CncaChinaAdapter } from './adapters/cnca-china.adapter';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    @InjectRepository(CrawledItem)
    private readonly crawledItemRepo: Repository<CrawledItem>,
    @InjectRepository(IntelligenceSource)
    private readonly sourceRepo: Repository<IntelligenceSource>,
  ) {}

  private getAdapters(tenantId: string): BaseAdapter[] {
    return [
      new CpscRecallsAdapter(tenantId),
      new EuSafetyGateAdapter(tenantId),
      new FederalRegisterAdapter(tenantId),
      new EurLexAdapter(tenantId),
      new IsoStandardsAdapter(tenantId),
      new IecWebstoreAdapter(tenantId),
      new SamrChinaAdapter(tenantId),
      new CncaChinaAdapter(tenantId),
    ];
  }

  async fetchAll(tenantId: string): Promise<{ saved: number; skipped: number; errors: number }> {
    const adapters = this.getAdapters(tenantId);
    let saved = 0;
    let skipped = 0;
    let errors = 0;

    for (const adapter of adapters) {
      try {
        this.logger.log(`Fetching from adapter: ${adapter['config'].name}`);
        const items = await adapter.fetch();
        const result = await this.saveItems(items);
        saved += result.saved;
        skipped += result.skipped;
        this.logger.log(`Adapter ${adapter['config'].name}: saved=${result.saved}, skipped=${result.skipped}`);
      } catch (err) {
        errors++;
        this.logger.error(
          `Adapter ${adapter['config'].name} failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return { saved, skipped, errors };
  }

  private async saveItems(
    items: CrawledItemDto[],
  ): Promise<{ saved: number; skipped: number }> {
    let saved = 0;
    let skipped = 0;

    for (const item of items) {
      const exists = await this.crawledItemRepo.findOne({
        where: { fingerprint: item.fingerprint },
      });

      if (exists) {
        skipped++;
        continue;
      }

      await this.crawledItemRepo.save(
        this.crawledItemRepo.create({
          sourceId: item.sourceId,
          tenantId: item.tenantId,
          sourceType: item.sourceType,
          title: item.title,
          url: item.url,
          publishDate: new Date(item.publishDate),
          rawContent: item.rawContent,
          fingerprint: item.fingerprint,
          contentHash: item.contentHash,
          metadata: item.metadata ?? null,
          processed: false,
        }),
      );
      saved++;
    }

    return { saved, skipped };
  }

  async getUnprocessedItems(limit = 50): Promise<CrawledItem[]> {
    return this.crawledItemRepo.find({
      where: { processed: false },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async markProcessed(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.crawledItemRepo.update(ids, { processed: true });
  }

  async createSource(tenantId: string, dto: CreateSourceDto): Promise<IntelligenceSource> {
    const source = this.sourceRepo.create({ ...dto, tenantId });
    return this.sourceRepo.save(source);
  }

  async listSources(tenantId: string): Promise<IntelligenceSource[]> {
    return this.sourceRepo.find({ where: { tenantId } });
  }

  async listCrawledItems(
    tenantId: string,
    page = 1,
    pageSize = 20,
  ): Promise<{ data: CrawledItem[]; total: number }> {
    const [data, total] = await this.crawledItemRepo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { data, total };
  }
}
