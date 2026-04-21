import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { SourceType } from '@sentinel/types';

@Entity('crawled_items')
@Index(['fingerprint'], { unique: true })
@Index(['tenantId', 'sourceType'])
export class CrawledItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 36 })
  sourceId!: string;

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

  @Column({ type: 'longtext' })
  rawContent!: string;

  @Column({ length: 64, unique: true })
  fingerprint!: string;

  @Column({ length: 64 })
  contentHash!: string;

  @Column({ default: false })
  processed!: boolean;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
