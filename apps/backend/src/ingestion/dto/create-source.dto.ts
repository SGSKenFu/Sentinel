import { IsString, IsUrl, IsEnum, IsBoolean, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SourceType } from '@sentinel/types';

export class CreateSourceDto {
  @ApiProperty({ description: 'Source name' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: SourceType })
  @IsEnum(SourceType)
  sourceType!: SourceType;

  @ApiProperty({ description: 'Source URL' })
  @IsUrl()
  url!: string;

  @ApiPropertyOptional({ description: 'Cron expression for scheduling' })
  @IsOptional()
  @IsString()
  cronExpression?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Adapter-specific configuration' })
  @IsOptional()
  @IsObject()
  adapterConfig?: Record<string, unknown>;
}
