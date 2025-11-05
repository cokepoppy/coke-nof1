import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('market_data')
@Index(['symbol', 'timestamp'])
@Index(['symbol', 'intervalType'])
export class MarketData {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Column({ length: 20 })
  symbol!: string;

  @Column({ type: 'timestamp' })
  timestamp!: Date;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  open!: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  high!: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  low!: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  close!: number;

  @Column({ type: 'decimal', precision: 30, scale: 8 })
  volume!: number;

  @Column({
    name: 'interval_type',
    type: 'enum',
    enum: ['1m', '3m', '5m', '15m', '1h', '4h', '1d'],
  })
  intervalType!: string;

  @Column({ name: 'ema_20', type: 'decimal', precision: 20, scale: 8, nullable: true })
  ema20?: number;

  @Column({ name: 'ema_50', type: 'decimal', precision: 20, scale: 8, nullable: true })
  ema50?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  rsi?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  macd?: number;

  @Column({ name: 'macd_signal', type: 'decimal', precision: 20, scale: 8, nullable: true })
  macdSignal?: number;

  @Column({ name: 'macd_histogram', type: 'decimal', precision: 20, scale: 8, nullable: true })
  macdHistogram?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  atr?: number;

  @Column({ name: 'open_interest', type: 'decimal', precision: 30, scale: 8, nullable: true })
  openInterest?: number;

  @Column({ name: 'funding_rate', type: 'decimal', precision: 10, scale: 8, nullable: true })
  fundingRate?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
