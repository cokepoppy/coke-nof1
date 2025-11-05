import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AIModel } from './AIModel';

@Entity('decision_logs')
@Index(['modelId', 'timestamp'])
export class DecisionLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Column({ name: 'model_id' })
  modelId!: number;

  @ManyToOne(() => AIModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'model_id' })
  model!: AIModel;

  @Column({ type: 'timestamp' })
  timestamp!: Date;

  @Column({
    name: 'decision_type',
    type: 'enum',
    enum: ['LONG', 'SHORT', 'HOLD', 'CLOSE'],
  })
  decisionType!: string;

  @Column({ length: 20, nullable: true })
  symbol?: string;

  @Column({ type: 'text' })
  reasoning!: string;

  @Column({ name: 'market_context', type: 'json', nullable: true })
  marketContext?: any;

  @Column({ name: 'account_context', type: 'json', nullable: true })
  accountContext?: any;

  @Column({ name: 'output_json', type: 'json', nullable: true })
  outputJson?: any;

  @Column({
    name: 'execution_status',
    type: 'enum',
    enum: ['pending', 'executed', 'failed', 'skipped'],
    default: 'pending',
  })
  executionStatus!: string;

  @Column({ name: 'execution_error', type: 'text', nullable: true })
  executionError?: string;

  @Column({ name: 'latency_ms', type: 'int', nullable: true })
  latencyMs?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
