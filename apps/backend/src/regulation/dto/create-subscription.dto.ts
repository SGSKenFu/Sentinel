import {
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SourceType, RiskLevel, NotificationChannel } from '@sentinel/types';
import { Transform } from 'class-transformer';

export class CreateSubscriptionDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  keywords!: string[];

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

  @ApiProperty({ enum: NotificationChannel, isArray: true })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  channels!: NotificationChannel[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
