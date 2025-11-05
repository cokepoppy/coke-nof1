import { useState } from 'react';
import { mockPrices, mockModels, mockTrades } from '../utils/mockData';
import AccountValueChart from '../components/trading/AccountValueChart';
import './Live.css';

const Live = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | '72h' | 'completed' | 'chat' | 'positions' | 'readme'>('completed');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [chartTimeRange, setChartTimeRange] = useState<'all' | '72h'>('all');

  // Calculate highest and lowest performing models
  const sortedByPnl = [...mockModels].sort((a, b) => b.pnlPct - a.pnlPct);
  const highest = sortedByPnl[0];
  const lowest = sortedByPnl[sortedByPnl.length - 1];

  return (
    <div className="live-container">
      {/* Top Price Status Bar */}
      <div className="top-status-bar">
        <div className="status-bar-content">
          {/* Crypto Prices */}
          <div className="crypto-prices">
            {mockPrices.map((price) => (
              <div key={price.symbol} className="price-item">
                <div className="price-header">
                  <span className="crypto-symbol">{price.symbol}</span>
                </div>
                <div className="price-value">
                  ${price.price.toLocaleString(undefined, {
                    minimumFractionDigits: price.symbol === 'DOGE' ? 4 : 2,
                    maximumFractionDigits: price.symbol === 'DOGE' ? 4 : 2
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Best/Worst Performers */}
          <div className="performers">
            <span className="performer-label">HIGHEST:</span>
            <span className="performer-icon">{highest.logo}</span>
            <span className="performer-name">{highest.name}</span>
            <span className="performer-value">${highest.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="terminal-positive">+{highest.pnlPct.toFixed(2)}%</span>

            <span className="separator">|</span>

            <span className="performer-label">LOWEST:</span>
            <span className="performer-icon">{lowest.logo}</span>
            <span className="performer-name">{lowest.name}</span>
            <span className="performer-value">${lowest.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="terminal-negative">{lowest.pnlPct.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Left Section */}
        <div className="left-section">
          {/* Chart Area */}
          <div className="chart-area">
            <div className="chart-header">
              <h2>TOTAL ACCOUNT VALUE</h2>
              <div className="chart-time-selector">
                <button
                  className={`time-btn ${chartTimeRange === 'all' ? 'active' : ''}`}
                  onClick={() => setChartTimeRange('all')}
                >
                  ALL
                </button>
                <button
                  className={`time-btn ${chartTimeRange === '72h' ? 'active' : ''}`}
                  onClick={() => setChartTimeRange('72h')}
                >
                  72H
                </button>
              </div>
            </div>
            <div className="chart-container">
              <AccountValueChart />
            </div>
          </div>

          {/* Model Cards */}
          <div className="model-cards-section">
            <div className="model-cards-grid">
              {mockModels.map((model) => (
                <div key={model.id} className="model-card-mini">
                  <div className="model-card-header">
                    <span className="model-logo">{model.logo}</span>
                    <span className="model-name">{model.name}</span>
                  </div>
                  <div className="model-card-balance">
                    ${model.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Trade History */}
        <div className="right-section">
          {/* Tabs */}
          <div className="trade-tabs">
            <button
              className={`trade-tab ${selectedTab === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedTab('all')}
            >
              ALL
            </button>
            <button
              className={`trade-tab ${selectedTab === '72h' ? 'active' : ''}`}
              onClick={() => setSelectedTab('72h')}
            >
              72H
            </button>
            <button
              className={`trade-tab ${selectedTab === 'completed' ? 'active' : ''}`}
              onClick={() => setSelectedTab('completed')}
            >
              COMPLETED TRADES
            </button>
            <button
              className={`trade-tab ${selectedTab === 'chat' ? 'active' : ''}`}
              onClick={() => setSelectedTab('chat')}
            >
              MODELCHAT
            </button>
            <button
              className={`trade-tab ${selectedTab === 'positions' ? 'active' : ''}`}
              onClick={() => setSelectedTab('positions')}
            >
              POSITIONS
            </button>
            <button
              className={`trade-tab ${selectedTab === 'readme' ? 'active' : ''}`}
              onClick={() => setSelectedTab('readme')}
            >
              README.TXT
            </button>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="filter-controls">
              <span className="filter-label">FILTER:</span>
              <select
                className="filter-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="all">ALL MODELS ▼</option>
                {mockModels.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>
            <span className="trade-count">Showing Last 100 Trades</span>
          </div>

          {/* Trade List */}
          <div className="trade-list">
            {selectedTab === 'completed' && mockTrades.map((trade) => (
              <div key={trade.id} className="trade-item">
                <div className="trade-header">
                  <div className="trade-info">
                    <span className="model-icon">{trade.modelLogo}</span>
                    <span className="model-name-inline">{trade.modelName}</span>
                    <span> completed a </span>
                    <span className={`trade-side ${trade.side.toLowerCase()}`}>{trade.side.toLowerCase()}</span>
                    <span> trade on </span>
                    <span className="trade-symbol">{trade.symbol}</span>
                    <span>!</span>
                  </div>
                  <span className="trade-time">
                    {trade.exitTime && (
                      <>
                        {trade.exitTime.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })},{' '}
                        {trade.exitTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </>
                    )}
                  </span>
                </div>

                <div className="trade-details">
                  <div className="trade-detail-row">
                    Price: ${trade.entryPrice.toLocaleString()} → ${trade.exitPrice?.toLocaleString()}
                  </div>
                  <div className="trade-detail-row">
                    Quantity: {trade.quantity}
                  </div>
                  <div className="trade-detail-row">
                    Notional: ${(trade.entryPrice * trade.quantity).toLocaleString()} → ${trade.exitPrice ? (trade.exitPrice * trade.quantity).toLocaleString() : '0'}
                  </div>
                  {trade.exitTime && (
                    <div className="trade-detail-row">
                      Holding time: {Math.floor((trade.exitTime.getTime() - trade.entryTime.getTime()) / (1000 * 60 * 60))}H {Math.floor(((trade.exitTime.getTime() - trade.entryTime.getTime()) % (1000 * 60 * 60)) / (1000 * 60))}M
                    </div>
                  )}

                  <div className="trade-pnl">
                    <span className="pnl-label">NET P&L:</span>
                    <span className={`pnl-value ${trade.profitLoss && trade.profitLoss >= 0 ? 'profit' : 'loss'}`}>
                      {trade.profitLoss && trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Live;
