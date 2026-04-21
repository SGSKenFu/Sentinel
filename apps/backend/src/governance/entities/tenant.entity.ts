import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200, unique: true })
  name!: string;

  @Column({ length: 100, unique: true })
  slug!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'json', nullable: true })
  settings!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
