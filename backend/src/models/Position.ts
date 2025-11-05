import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AIModel } from './AIModel';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'model_id' })
  modelId!: number;

  @ManyToOne(() => AIModel, model => model.positions, { onDelete: 'CASCADE' })
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

  @Column({ name: 'current_price', type: 'decimal', precision: 20, scale: 8 })
  currentPrice!: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity!: number;

  @Column({ type: 'int' })
  leverage!: number;

  @Column({ name: 'unrealized_pnl', type: 'decimal', precision: 20, scale: 8, nullable: true })
  unrealizedPnl?: number;

  @Column({ name: 'unrealized_pnl_pct', type: 'decimal', precision: 10, scale: 4, nullable: true })
  unrealizedPnlPct?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  margin?: number;

  @Column({ name: 'liquidation_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  liquidationPrice?: number;

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

  @Column({ name: 'opened_at', type: 'timestamp' })
  openedAt!: Date;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated!: Date;
}
