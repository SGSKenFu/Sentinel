import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertRuleEntity } from './entities/alert-rule.entity';
import { SubscriptionEntity } from './entities/subscription.entity';
import { RuleService } from './rule.service';
import { SubscriptionService } from './subscription.service';
import { RuleEngineService } from './rule-engine.service';
import { RegulationController } from './regulation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlertRuleEntity, SubscriptionEntity])],
  controllers: [RegulationController],
  providers: [RuleService, SubscriptionService, RuleEngineService],
  exports: [RuleService, SubscriptionService, RuleEngineService],
})
export class RegulationModule {}
