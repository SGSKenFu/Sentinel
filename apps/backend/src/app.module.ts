import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';
import { getDatabaseConfig } from './config/database.config';
import { IngestionModule } from './ingestion/ingestion.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { RegulationModule } from './regulation/regulation.module';
import { NotificationModule } from './notification/notification.module';
import { GovernanceModule } from './governance/governance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    WinstonModule.forRoot(winstonConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    IngestionModule,
    IntelligenceModule,
    RegulationModule,
    NotificationModule,
    GovernanceModule,
  ],
})
export class AppModule {}
