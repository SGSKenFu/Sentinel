import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 36 })
  tenantId!: string;

  @Column({ length: 200, unique: true })
  email!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 255, select: false })
  passwordHash!: string;

  @Column({ type: 'json', default: '["viewer"]' })
  roles!: string[];

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
