import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { AIModel } from '../models/AIModel';
import { Trade } from '../models/Trade';
import { Position } from '../models/Position';
import { MarketData } from '../models/MarketData';
import { DecisionLog } from '../models/DecisionLog';
import { PerformanceMetric } from '../models/PerformanceMetric';
import { BlogPost } from '../models/BlogPost';
import { Waitlist } from '../models/Waitlist';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nof1_db',
  synchronize: process.env.NODE_ENV === 'development', // Auto-sync in dev only
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    AIModel,
    Trade,
    Position,
    MarketData,
    DecisionLog,
    PerformanceMetric,
    BlogPost,
    Waitlist,
  ],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
  charset: 'utf8mb4',
});
