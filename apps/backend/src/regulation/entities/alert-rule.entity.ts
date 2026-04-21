import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RuleCondition, RuleAction } from '@sentinel/types';

@Entity('alert_rules')
export class AlertRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 36 })
  tenantId!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'json' })
  conditions!: RuleCondition[];

  @Column({ type: 'json' })
  actions!: RuleAction[];

  @Column({ default: true })
  enabled!: boolean;

  @Column({ default: 0 })
  priority!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
