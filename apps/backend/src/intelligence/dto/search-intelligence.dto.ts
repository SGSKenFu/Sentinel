import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RiskLevel, SourceType } from '@sentinel/types';
import { Transform } from 'class-transformer';

export class SearchIntelligenceDto {
  @ApiPropertyOptional({ description: 'Full-text keyword search' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ enum: SourceType, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(SourceType, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  sourceTypes?: SourceType[];

  @ApiPropertyOptional({ enum: RiskLevel, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(RiskLevel, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  riskLevels?: RiskLevel[];

  @ApiPropertyOptional({ description: 'Date from (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Date to (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Filter by tags', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  tags?: string[];

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value as string, 10))
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value as string, 10))
  pageSize?: number = 20;
}
