import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { NotificationChannel } from '@sentinel/types';

@Entity('notification_records')
export class NotificationRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 36 })
  tenantId!: string;

  @Column({ length: 36, nullable: true })
  subscriptionId!: string | null;

  @Column({ length: 36, nullable: true })
  ruleId!: string | null;

  @Column({ length: 36, nullable: true })
  intelligenceItemId!: string | null;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel!: NotificationChannel;

  @Column({ type: 'text' })
  payload!: string;

  @Column({ default: false })
  success!: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn()
  sentAt!: Date;
}
