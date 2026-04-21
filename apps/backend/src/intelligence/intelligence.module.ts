import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IntelligenceItemEntity } from './entities/intelligence-item.entity';
import { IntelligenceService } from './intelligence.service';
import { IntelligenceController } from './intelligence.controller';
import { NormalizerService } from './normalizer.service';
import { EnrichmentService } from './enrichment.service';
import { ScoringService } from './scoring.service';
import { OpenSearchService } from './opensearch.service';
import { createOpenSearchClient, OPENSEARCH_CLIENT } from '../config/opensearch.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([IntelligenceItemEntity]),
    ConfigModule,
  ],
  controllers: [IntelligenceController],
  providers: [
    IntelligenceService,
    NormalizerService,
    EnrichmentService,
    ScoringService,
    OpenSearchService,
    {
      provide: OPENSEARCH_CLIENT,
      useFactory: createOpenSearchClient,
      inject: [ConfigService],
    },
  ],
  exports: [IntelligenceService],
})
export class IntelligenceModule {}
