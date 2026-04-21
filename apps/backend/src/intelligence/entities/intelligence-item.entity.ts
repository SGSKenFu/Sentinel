import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { RiskLevel, SourceType, ProcessingChainEntry } from '@sentinel/types';

@Entity('intelligence_items')
@Index(['tenantId', 'sourceType'])
@Index(['tenantId', 'riskLevel'])
@Index(['fingerprint'], { unique: true })
export class IntelligenceItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 36 })
  tenantId!: string;

  @Column({ type: 'enum', enum: SourceType })
  sourceType!: SourceType;

  @Column({ length: 500 })
  title!: string;

  @Column({ length: 2000 })
  url!: string;

  @Column({ type: 'datetime' })
  publishDate!: Date;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'json', default: '[]' })
  tags!: string[];

  @Column({ type: 'enum', enum: RiskLevel, default: RiskLevel.INFO })
  riskLevel!: RiskLevel;

  @Column({ length: 64, unique: true })
  fingerprint!: string;

  @Column({ length: 64 })
  contentHash!: string;

  @Column({ type: 'json', default: '[]' })
  processingChain!: ProcessingChainEntry[];

  @Column({ length: 36, nullable: true })
  rawDataId!: string | null;

  @Column({ type: 'datetime', nullable: true })
  enrichedAt!: Date | null;

  @Column({ length: 50, nullable: true })
  llmVersion!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
