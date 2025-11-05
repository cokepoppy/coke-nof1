import './ModelCard.css';

interface ModelCardProps {
  id: number;
  name: string;
  provider: string;
  balance: number;
  initialBalance: number;
  pnl: number;
  pnlPct: number;
  status: 'active' | 'paused' | 'stopped';
  sharpeRatio?: number;
  winRate?: number;
  totalTrades?: number;
  onClick?: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({
  name,
  provider,
  balance,
  initialBalance,
  pnl,
  pnlPct,
  status,
  sharpeRatio,
  winRate,
  totalTrades,
  onClick,
}) => {
  const isProfitable = pnl >= 0;
  const statusColor = {
    active: '#52c41a',
    paused: '#faad14',
    stopped: '#8c8c8c',
  }[status];

  return (
    <div className="model-card" onClick={onClick}>
      <div className="model-card-header">
        <div className="model-info">
          <h3 className="model-name">{name}</h3>
          <span className="model-provider">{provider}</span>
        </div>
        <div className="model-status" style={{ backgroundColor: statusColor }}>
          {status}
        </div>
      </div>

      <div className="model-balance">
        <div className="balance-main">
          <span className="balance-label">Balance</span>
          <span className="balance-value">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className={`balance-change ${isProfitable ? 'positive' : 'negative'}`}>
          {isProfitable ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="pnl-pct">({isProfitable ? '+' : ''}{pnlPct.toFixed(2)}%)</span>
        </div>
      </div>

      <div className="model-metrics">
        {sharpeRatio !== undefined && (
          <div className="metric">
            <span className="metric-label">Sharpe</span>
            <span className="metric-value">{sharpeRatio.toFixed(2)}</span>
          </div>
        )}
        {winRate !== undefined && (
          <div className="metric">
            <span className="metric-label">Win Rate</span>
            <span className="metric-value">{winRate.toFixed(1)}%</span>
          </div>
        )}
        {totalTrades !== undefined && (
          <div className="metric">
            <span className="metric-label">Trades</span>
            <span className="metric-value">{totalTrades}</span>
          </div>
        )}
      </div>

      <div className="model-progress">
        <div
          className="progress-bar"
          style={{
            width: `${Math.min(Math.max((balance / initialBalance) * 100, 0), 200)}%`,
            backgroundColor: isProfitable ? 'var(--success-color)' : 'var(--error-color)'
          }}
        />
      </div>
    </div>
  );
};

export default ModelCard;
