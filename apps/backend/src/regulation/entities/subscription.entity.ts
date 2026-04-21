import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SourceType, RiskLevel, NotificationChannel } from '@sentinel/types';

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 36 })
  userId!: string;

  @Column({ length: 36 })
  tenantId!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ type: 'json', default: '[]' })
  keywords!: string[];

  @Column({ type: 'json', default: '[]' })
  sourceTypes!: SourceType[];

  @Column({ type: 'json', default: '[]' })
  riskLevels!: RiskLevel[];

  @Column({ type: 'json', default: '[]' })
  channels!: NotificationChannel[];

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
