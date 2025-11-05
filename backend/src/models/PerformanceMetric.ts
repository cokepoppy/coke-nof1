import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AIModel } from './AIModel';

@Entity('performance_metrics')
@Index(['modelId', 'calculationTime'])
export class PerformanceMetric {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'model_id' })
  modelId!: number;

  @ManyToOne(() => AIModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'model_id' })
  model!: AIModel;

  @Column({ name: 'calculation_time', type: 'timestamp' })
  calculationTime!: Date;

  @Column({ name: 'total_pnl', type: 'decimal', precision: 20, scale: 8, nullable: true })
  totalPnl?: number;

  @Column({ name: 'total_pnl_pct', type: 'decimal', precision: 10, scale: 4, nullable: true })
  totalPnlPct?: number;

  @Column({ name: 'realized_pnl', type: 'decimal', precision: 20, scale: 8, nullable: true })
  realizedPnl?: number;

  @Column({ name: 'unrealized_pnl', type: 'decimal', precision: 20, scale: 8, nullable: true })
  unrealizedPnl?: number;

  @Column({ name: 'total_trades', type: 'int', default: 0 })
  totalTrades!: number;

  @Column({ name: 'winning_trades', type: 'int', default: 0 })
  winningTrades!: number;

  @Column({ name: 'losing_trades', type: 'int', default: 0 })
  losingTrades!: number;

  @Column({ name: 'win_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  winRate?: number;

  @Column({ name: 'sharpe_ratio', type: 'decimal', precision: 10, scale: 4, nullable: true })
  sharpeRatio?: number;

  @Column({ name: 'max_drawdown', type: 'decimal', precision: 10, scale: 4, nullable: true })
  maxDrawdown?: number;

  @Column({ name: 'max_drawdown_pct', type: 'decimal', precision: 10, scale: 4, nullable: true })
  maxDrawdownPct?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  volatility?: number;

  @Column({ name: 'avg_trade_duration_minutes', type: 'int', nullable: true })
  avgTradeDurationMinutes?: number;

  @Column({ name: 'avg_profit_per_trade', type: 'decimal', precision: 20, scale: 8, nullable: true })
  avgProfitPerTrade?: number;

  @Column({ name: 'avg_loss_per_trade', type: 'decimal', precision: 20, scale: 8, nullable: true })
  avgLossPerTrade?: number;

  @Column({ name: 'profit_factor', type: 'decimal', precision: 10, scale: 4, nullable: true })
  profitFactor?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
