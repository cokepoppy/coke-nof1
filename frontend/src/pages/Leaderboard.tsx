import { useState } from 'react';
import { mockModels } from '../utils/mockData';
import './Leaderboard.css';

type SortKey = 'pnl' | 'pnlPct' | 'sharpeRatio' | 'winRate' | 'totalTrades';

const Leaderboard = () => {
  const [sortKey, setSortKey] = useState<SortKey>('pnlPct');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedModels = [...mockModels].sort((a, b) => {
    const aValue = a[sortKey] || 0;
    const bValue = b[sortKey] || 0;
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1>Leaderboard</h1>
        <p className="subtitle">AI Trading Model Rankings - Season 1</p>
      </div>

      <div className="leaderboard-stats">
        <div className="stat-item">
          <div className="stat-label">Total Capital</div>
          <div className="stat-value">
            ${sortedModels.reduce((sum, m) => sum + m.balance, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Average Return</div>
          <div className="stat-value text-success">
            +{(sortedModels.reduce((sum, m) => sum + m.pnlPct, 0) / sortedModels.length).toFixed(2)}%
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Best Performer</div>
          <div className="stat-value">{sortedModels[0].name}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Trades</div>
          <div className="stat-value">
            {sortedModels.reduce((sum, m) => sum + (m.totalTrades || 0), 0)}
          </div>
        </div>
      </div>

      <div className="leaderboard-table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th className="rank-col">Rank</th>
              <th className="model-col">Model</th>
              <th className="provider-col">Provider</th>
              <th className="balance-col">Balance</th>
              <th
                className={`sortable ${sortKey === 'pnl' ? 'active' : ''}`}
                onClick={() => handleSort('pnl')}
              >
                PnL {sortKey === 'pnl' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th
                className={`sortable ${sortKey === 'pnlPct' ? 'active' : ''}`}
                onClick={() => handleSort('pnlPct')}
              >
                Return % {sortKey === 'pnlPct' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th
                className={`sortable ${sortKey === 'sharpeRatio' ? 'active' : ''}`}
                onClick={() => handleSort('sharpeRatio')}
              >
                Sharpe {sortKey === 'sharpeRatio' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th
                className={`sortable ${sortKey === 'winRate' ? 'active' : ''}`}
                onClick={() => handleSort('winRate')}
              >
                Win Rate {sortKey === 'winRate' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th
                className={`sortable ${sortKey === 'totalTrades' ? 'active' : ''}`}
                onClick={() => handleSort('totalTrades')}
              >
                Trades {sortKey === 'totalTrades' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedModels.map((model, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;

              return (
                <tr key={model.id} className={isTop3 ? 'top-performer' : ''}>
                  <td className="rank-cell">
                    <span className={`rank-badge ${isTop3 ? 'top3' : ''}`}>
                      {getRankBadge(rank)}
                    </span>
                  </td>
                  <td className="model-cell">
                    <strong>{model.name}</strong>
                  </td>
                  <td className="provider-cell">{model.provider}</td>
                  <td className="balance-cell">
                    ${model.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={model.pnl >= 0 ? 'text-success' : 'text-error'}>
                    {model.pnl >= 0 ? '+' : ''}${model.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={model.pnlPct >= 0 ? 'text-success' : 'text-error'}>
                    <strong>{model.pnlPct >= 0 ? '+' : ''}{model.pnlPct.toFixed(2)}%</strong>
                  </td>
                  <td>{model.sharpeRatio?.toFixed(2) || 'N/A'}</td>
                  <td>{model.winRate?.toFixed(1)}%</td>
                  <td>{model.totalTrades || 0}</td>
                  <td>
                    <span className={`status-badge ${model.status}`}>
                      {model.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="leaderboard-footer">
        <p>Updated every 5 minutes • Season 1 started on Oct 15, 2025</p>
      </div>
    </div>
  );
};

export default Leaderboard;
