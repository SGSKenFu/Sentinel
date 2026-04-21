import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SourceType } from '@sentinel/types';

@Entity('intelligence_sources')
export class IntelligenceSource {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'enum', enum: SourceType })
  sourceType!: SourceType;

  @Column({ length: 500 })
  url!: string;

  @Column({ length: 100, nullable: true })
  cronExpression!: string;

  @Column({ default: true })
  enabled!: boolean;

  @Column({ length: 36 })
  tenantId!: string;

  @Column({ type: 'json', nullable: true })
  adapterConfig!: Record<string, unknown>;

  @Column({ type: 'datetime', nullable: true })
  lastFetchedAt!: Date | null;

  @Column({ default: 0 })
  failureCount!: number;

  @Column({ type: 'text', nullable: true })
  lastError!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
