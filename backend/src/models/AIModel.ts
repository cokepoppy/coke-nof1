import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Trade } from './Trade';
import { Position } from './Position';

@Entity('ai_models')
export class AIModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 50 })
  provider!: string;

  @Column({ name: 'model_id', length: 100 })
  modelId!: string;

  @Column({ name: 'api_key_encrypted', type: 'text', nullable: true })
  apiKeyEncrypted?: string;

  @Column({ name: 'system_prompt', type: 'text' })
  systemPrompt!: string;

  @Column({ name: 'initial_balance', type: 'decimal', precision: 20, scale: 8, default: 10000 })
  initialBalance!: number;

  @Column({ name: 'current_balance', type: 'decimal', precision: 20, scale: 8, nullable: true })
  currentBalance?: number;

  @Column({
    type: 'enum',
    enum: ['active', 'paused', 'stopped'],
    default: 'paused',
  })
  status!: string;

  @Column({ type: 'json', nullable: true })
  config?: any;

  @Column({ type: 'int', default: 1 })
  season!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Trade, trade => trade.model)
  trades!: Trade[];

  @OneToMany(() => Position, position => position.model)
  positions!: Position[];
}
