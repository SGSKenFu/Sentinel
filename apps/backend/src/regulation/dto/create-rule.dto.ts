import {
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsInt,
  ValidateNested,
  IsEnum,
  IsIn,
  IsObject,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RuleCondition, RuleAction } from '@sentinel/types';

export class RuleConditionDto implements RuleCondition {
  @ApiProperty()
  @IsString()
  field!: string;

  @ApiProperty({ enum: ['eq', 'neq', 'contains', 'startsWith', 'in', 'gte', 'lte'] })
  @IsIn(['eq', 'neq', 'contains', 'startsWith', 'in', 'gte', 'lte'])
  operator!: 'eq' | 'neq' | 'contains' | 'startsWith' | 'in' | 'gte' | 'lte';

  @ApiProperty()
  value!: string | string[] | number;
}

export class RuleActionDto implements RuleAction {
  @ApiProperty({ enum: ['notify', 'webhook', 'tag'] })
  @IsIn(['notify', 'webhook', 'tag'])
  type!: 'notify' | 'webhook' | 'tag';

  @ApiProperty()
  @IsObject()
  config!: Record<string, string>;
}

export class CreateRuleDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [RuleConditionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleConditionDto)
  conditions!: RuleConditionDto[];

  @ApiProperty({ type: [RuleActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleActionDto)
  actions!: RuleActionDto[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;
}
