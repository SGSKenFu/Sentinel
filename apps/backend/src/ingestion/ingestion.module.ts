import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { SchedulerService } from './scheduler.service';
import { CrawledItem } from './entities/crawled-item.entity';
import { IntelligenceSource } from './entities/intelligence-source.entity';
import { IntelligenceModule } from '../intelligence/intelligence.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CrawledItem, IntelligenceSource]),
    forwardRef(() => IntelligenceModule),
  ],
  controllers: [IngestionController],
  providers: [IngestionService, SchedulerService],
  exports: [IngestionService],
})
export class IngestionModule {}
