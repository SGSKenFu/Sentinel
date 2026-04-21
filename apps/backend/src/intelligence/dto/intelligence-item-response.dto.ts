import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RiskLevel, SourceType, ProcessingChainEntry } from '@sentinel/types';

export class IntelligenceItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ enum: SourceType })
  sourceType!: SourceType;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  publishDate!: Date;

  @ApiProperty()
  summary!: string;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty({ enum: RiskLevel })
  riskLevel!: RiskLevel;

  @ApiProperty()
  fingerprint!: string;

  @ApiProperty()
  contentHash!: string;

  @ApiProperty()
  processingChain!: ProcessingChainEntry[];

  @ApiPropertyOptional()
  rawDataId?: string;

  @ApiPropertyOptional()
  enrichedAt?: Date;

  @ApiPropertyOptional()
  llmVersion?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
