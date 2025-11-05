import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('waitlist')
export class Waitlist {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ length: 255, nullable: true })
  name?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'invited', 'registered'],
    default: 'pending',
  })
  status!: string;

  @Column({ length: 100, nullable: true })
  source?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'invited_at', type: 'timestamp', nullable: true })
  invitedAt?: Date;
}
