import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { AuditAction } from '@sentinel/types';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 36, nullable: true })
  userId!: string | null;

  @Column({ length: 36 })
  tenantId!: string;

  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction;

  @Column({ length: 100 })
  resource!: string;

  @Column({ length: 36, nullable: true })
  resourceId!: string | null;

  @Column({ type: 'json', nullable: true })
  changes!: Record<string, unknown> | null;

  @Column({ length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ length: 500, nullable: true })
  userAgent!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
