import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { IngestionService } from './ingestion.service';
import { IntelligenceService } from '../intelligence/intelligence.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly ingestionService: IngestionService,
    private readonly intelligenceService: IntelligenceService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_4_HOURS)
  async runIngestion(): Promise<void> {
    this.logger.log('Scheduled ingestion started');
    const tenantId = this.configService.get<string>(
      'DEFAULT_TENANT_ID',
      '00000000-0000-0000-0000-000000000001',
    );
    try {
      const result = await this.ingestionService.fetchAll(tenantId);
      this.logger.log(`Ingestion complete: ${JSON.stringify(result)}`);
    } catch (err) {
      this.logger.error('Scheduled ingestion failed', err instanceof Error ? err.stack : err);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async runEnrichment(): Promise<void> {
    this.logger.log('Scheduled enrichment started');
    try {
      const unprocessed = await this.ingestionService.getUnprocessedItems(20);
      if (unprocessed.length === 0) {
        return;
      }

      let enriched = 0;
      for (const item of unprocessed) {
        try {
          await this.intelligenceService.processRawItem(item);
          enriched++;
        } catch (err) {
          this.logger.warn(
            `Failed to enrich item ${item.id}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      this.logger.log(`Enrichment complete: ${enriched}/${unprocessed.length} items processed`);
    } catch (err) {
      this.logger.error('Scheduled enrichment failed', err instanceof Error ? err.stack : err);
    }
  }
}
