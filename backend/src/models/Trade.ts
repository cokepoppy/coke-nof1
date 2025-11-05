import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AIModel } from './AIModel';

@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'model_id' })
  modelId!: number;

  @ManyToOne(() => AIModel, model => model.trades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'model_id' })
  model!: AIModel;

  @Column({ length: 20 })
  symbol!: string;

  @Column({
    type: 'enum',
    enum: ['LONG', 'SHORT'],
  })
  side!: string;

  @Column({ name: 'entry_price', type: 'decimal', precision: 20, scale: 8 })
  entryPrice!: number;

  @Column({ name: 'exit_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  exitPrice?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity!: number;

  @Column({ type: 'int' })
  leverage!: number;

  @Column({ name: 'entry_time', type: 'timestamp' })
  entryTime!: Date;

  @Column({ name: 'exit_time', type: 'timestamp', nullable: true })
  exitTime?: Date;

  @Column({
    type: 'enum',
    enum: ['open', 'closed', 'liquidated'],
    default: 'open',
  })
  status!: string;

  @Column({ name: 'profit_loss', type: 'decimal', precision: 20, scale: 8, nullable: true })
  profitLoss?: number;

  @Column({ name: 'profit_loss_pct', type: 'decimal', precision: 10, scale: 4, nullable: true })
  profitLossPct?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  fees?: number;

  @Column({ name: 'profit_target', type: 'decimal', precision: 20, scale: 8, nullable: true })
  profitTarget?: number;

  @Column({ name: 'stop_loss', type: 'decimal', precision: 20, scale: 8, nullable: true })
  stopLoss?: number;

  @Column({ name: 'invalidation_condition', type: 'text', nullable: true })
  invalidationCondition?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidence?: number;

  @Column({ name: 'entry_reason', type: 'text', nullable: true })
  entryReason?: string;

  @Column({ name: 'exit_reason', type: 'text', nullable: true })
  exitReason?: string;

  @Column({ name: 'exchange_order_id', length: 100, nullable: true })
  exchangeOrderId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
