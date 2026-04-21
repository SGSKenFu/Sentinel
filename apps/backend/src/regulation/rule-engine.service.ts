import { Injectable, Logger } from '@nestjs/common';
import { IntelligenceItemEntity } from '../intelligence/entities/intelligence-item.entity';
import { AlertRuleEntity } from './entities/alert-rule.entity';
import { RuleCondition } from '@sentinel/types';

type FieldValue = string | number | string[];

@Injectable()
export class RuleEngineService {
  private readonly logger = new Logger(RuleEngineService.name);

  evaluate(item: IntelligenceItemEntity, rules: AlertRuleEntity[]): AlertRuleEntity[] {
    return rules
      .filter((rule) => rule.enabled)
      .sort((a, b) => b.priority - a.priority)
      .filter((rule) => this.matchesAllConditions(item, rule.conditions));
  }

  private matchesAllConditions(item: IntelligenceItemEntity, conditions: RuleCondition[]): boolean {
    return conditions.every((cond) => this.evaluateCondition(item, cond));
  }

  private getFieldValue(item: IntelligenceItemEntity, field: string): FieldValue | undefined {
    const map: Record<string, FieldValue | undefined> = {
      sourceType: item.sourceType,
      riskLevel: item.riskLevel,
      title: item.title,
      summary: item.summary,
      tenantId: item.tenantId,
      tags: item.tags,
    };
    return map[field];
  }

  private evaluateCondition(item: IntelligenceItemEntity, cond: RuleCondition): boolean {
    const fieldValue = this.getFieldValue(item, cond.field);
    if (fieldValue === undefined) return false;

    const { operator, value } = cond;

    switch (operator) {
      case 'eq':
        return String(fieldValue) === String(value);

      case 'neq':
        return String(fieldValue) !== String(value);

      case 'contains':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(String(value));
        }
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());

      case 'startsWith':
        return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());

      case 'in':
        if (Array.isArray(value)) {
          if (Array.isArray(fieldValue)) {
            return (value as string[]).some((v) => (fieldValue as string[]).includes(v));
          }
          return (value as string[]).includes(String(fieldValue));
        }
        return false;

      case 'gte':
        return Number(fieldValue) >= Number(value);

      case 'lte':
        return Number(fieldValue) <= Number(value);

      default:
        this.logger.warn(`Unknown rule operator: ${operator as string}`);
        return false;
    }
  }
}
