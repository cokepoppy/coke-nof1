import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import AccountValueChart from '../components/trading/AccountValueChart';
import { useWebSocket } from '../hooks/useWebSocket';
import { getAIModels, getTrades, getPositions, getDecisionLogs, AIModel, Trade, Position, DecisionLog } from '../services/api';
import './Live.css';

// Model logo mapping
const MODEL_LOGOS: { [key: string]: string } = {
  'GPT 5': '🟢',
  'Claude 4.5 Sonnet': '🟣',
  'Gemini 2.5 Pro': '🔵',
  'DeepSeek V3.1 Chat': '🟠',
  'Grok 4': '⚫',
  'Qwen 3 Max': '🟡',
};

const Live = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | '72h' | 'completed' | 'chat' | 'positions' | 'readme'>('positions');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [chartTimeRange, setChartTimeRange] = useState<'all' | '72h'>('all');

  // Real data from API
  const [models, setModels] = useState<AIModel[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [modelsData, tradesData, positionsData, decisionsData] = await Promise.all([
          getAIModels(),
          getTrades({ limit: 100 }),
          getPositions(),
          getDecisionLogs({ limit: 50 }),
        ]);
        setModels(modelsData);
        setTrades(tradesData);
        setPositions(positionsData);
        setDecisionLogs(decisionsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle WebSocket updates
  const handleModelUpdate = useCallback((data: any) => {
    console.log('Model updated:', data);
    // Refresh models data
    getAIModels().then(setModels).catch(console.error);
  }, []);

  const handleNewTrade = useCallback((trade: any) => {
    console.log('New trade:', trade);
    // Refresh trades and positions
    Promise.all([
      getTrades({ limit: 100 }),
      getPositions(),
    ]).then(([tradesData, positionsData]) => {
      setTrades(tradesData);
      setPositions(positionsData);
    }).catch(console.error);
  }, []);

  // Connect to WebSocket with callbacks
  useWebSocket({
    onModelUpdate: handleModelUpdate,
    onTrade: handleNewTrade,
  });

  // Get real-time prices from Redux store
  const prices = useSelector((state: any) => state.market.prices);
  const priceArray = Object.values(prices).map((p: any) => ({
    symbol: p.symbol,
    price: p.price,
    change24h: p.change24h,
    volume24h: p.volume24h,
  }));

  // Calculate highest and lowest performing models
  const modelsWithPnl = models.map(model => ({
    ...model,
    logo: MODEL_LOGOS[model.name] || '⚪',
    pnlPct: ((Number(model.currentBalance) - Number(model.initialBalance)) / Number(model.initialBalance)) * 100,
  }));
  const sortedByPnl = [...modelsWithPnl].sort((a, b) => b.pnlPct - a.pnlPct);
  const highest = sortedByPnl[0] || { name: 'N/A', logo: '⚪', currentBalance: 0, pnlPct: 0 };
  const lowest = sortedByPnl[sortedByPnl.length - 1] || { name: 'N/A', logo: '⚪', currentBalance: 0, pnlPct: 0 };

  // Filter completed trades
  const completedTrades = trades.filter(t => t.status === 'CLOSED' || t.status === 'LIQUIDATED');

  return (
    <div className="live-container">
      {/* Top Price Status Bar */}
      <div className="top-status-bar">
        <div className="status-bar-content">
          {/* Crypto Prices */}
          <div className="crypto-prices">
            {priceArray.length > 0 ? priceArray.map((price: any) => (
              <div key={price.symbol} className="price-item">
                <div className="price-header">
                  <span className="crypto-symbol">{price.symbol}</span>
                  <span className={`price-change ${price.change24h >= 0 ? 'positive' : 'negative'}`}>
                    {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="price-value">
                  ${price.price.toLocaleString(undefined, {
                    minimumFractionDigits: price.symbol === 'DOGE' ? 4 : 2,
                    maximumFractionDigits: price.symbol === 'DOGE' ? 4 : 2
                  })}
                </div>
              </div>
            )) : (
              <div className="loading-prices">Loading real-time prices...</div>
            )}
          </div>

          {/* Best/Worst Performers */}
          <div className="performers">
            <span className="performer-label">HIGHEST:</span>
            <span className="performer-icon">{highest.logo}</span>
            <span className="performer-name">{highest.name}</span>
            <span className="performer-value">${Number(highest.currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={highest.pnlPct >= 0 ? "terminal-positive" : "terminal-negative"}>
              {highest.pnlPct >= 0 ? '+' : ''}{highest.pnlPct.toFixed(2)}%
            </span>

            <span className="separator">|</span>

            <span className="performer-label">LOWEST:</span>
            <span className="performer-icon">{lowest.logo}</span>
            <span className="performer-name">{lowest.name}</span>
            <span className="performer-value">${Number(lowest.currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={lowest.pnlPct >= 0 ? "terminal-positive" : "terminal-negative"}>
              {lowest.pnlPct >= 0 ? '+' : ''}{lowest.pnlPct.toFixed(2)}%
            </span>
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
            {loading ? (
              <div className="loading-message">Loading models...</div>
            ) : (
              <div className="model-cards-grid">
                {modelsWithPnl.map((model) => (
                  <div key={model.id} className="model-card-mini">
                    <div className="model-card-header">
                      <span className="model-logo">{model.logo}</span>
                      <span className="model-name">{model.name}</span>
                    </div>
                    <div className="model-card-balance">
                      ${Number(model.currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`model-card-pnl ${model.pnlPct >= 0 ? 'positive' : 'negative'}`}>
                      {model.pnlPct >= 0 ? '+' : ''}{model.pnlPct.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                {models.map(model => (
                  <option key={model.id} value={model.id.toString()}>{model.name}</option>
                ))}
              </select>
            </div>
            <span className="trade-count">
              {selectedTab === 'positions' ? `${positions.length} Active Positions` : `Showing Last ${trades.length} Trades`}
            </span>
          </div>

          {/* Trade List / Positions */}
          <div className="trade-list">
            {loading ? (
              <div className="loading-message">Loading data...</div>
            ) : selectedTab === 'positions' ? (
              positions.length === 0 ? (
                <div className="no-data-message">No active positions</div>
              ) : (
                positions
                  .filter(p => selectedModel === 'all' || p.model_id.toString() === selectedModel)
                  .map((position) => {
                    const model = models.find(m => m.id === position.model_id);
                    return (
                      <div key={position.id} className="trade-item">
                        <div className="trade-header">
                          <div className="trade-info">
                            <span className="model-icon">{MODEL_LOGOS[model?.name || ''] || '⚪'}</span>
                            <span className="model-name-inline">{model?.name || 'Unknown'}</span>
                            <span> has an open </span>
                            <span className={`trade-side ${position.side.toLowerCase()}`}>{position.side.toLowerCase()}</span>
                            <span> position on </span>
                            <span className="trade-symbol">{position.symbol}</span>
                          </div>
                          <span className="trade-time">
                            {new Date(position.opened_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })},{' '}
                            {new Date(position.opened_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>

                        <div className="trade-details">
                          <div className="trade-detail-row">
                            Entry Price: ${position.entry_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          <div className="trade-detail-row">
                            Current Price: ${position.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          <div className="trade-detail-row">
                            Quantity: {position.quantity} | Leverage: {position.leverage}x
                          </div>
                          <div className="trade-detail-row">
                            Notional: ${(position.entry_price * position.quantity * position.leverage).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          {position.liquidation_price && (
                            <div className="trade-detail-row">
                              Liquidation Price: ${position.liquidation_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                          )}

                          <div className="trade-pnl">
                            <span className="pnl-label">UNREALIZED P&L:</span>
                            <span className={`pnl-value ${position.unrealized_pnl >= 0 ? 'profit' : 'loss'}`}>
                              {position.unrealized_pnl >= 0 ? '+' : ''}${position.unrealized_pnl.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )
            ) : selectedTab === 'completed' ? (
              completedTrades.length === 0 ? (
                <div className="no-data-message">No completed trades yet</div>
              ) : (
                completedTrades
                  .filter(t => selectedModel === 'all' || t.model_id.toString() === selectedModel)
                  .map((trade) => {
                    const model = models.find(m => m.id === trade.model_id);
                    const entryTime = new Date(trade.entry_time);
                    const exitTime = trade.exit_time ? new Date(trade.exit_time) : null;

                    return (
                      <div key={trade.id} className="trade-item">
                        <div className="trade-header">
                          <div className="trade-info">
                            <span className="model-icon">{MODEL_LOGOS[model?.name || ''] || '⚪'}</span>
                            <span className="model-name-inline">{model?.name || 'Unknown'}</span>
                            <span> completed a </span>
                            <span className={`trade-side ${trade.side.toLowerCase()}`}>{trade.side.toLowerCase()}</span>
                            <span> trade on </span>
                            <span className="trade-symbol">{trade.symbol}</span>
                            <span>!</span>
                          </div>
                          <span className="trade-time">
                            {exitTime && (
                              <>
                                {exitTime.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })},{' '}
                                {exitTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </>
                            )}
                          </span>
                        </div>

                        <div className="trade-details">
                          <div className="trade-detail-row">
                            Price: ${trade.entry_price.toLocaleString()} → ${trade.exit_price?.toLocaleString() || 'N/A'}
                          </div>
                          <div className="trade-detail-row">
                            Quantity: {trade.quantity} | Leverage: {trade.leverage}x
                          </div>
                          <div className="trade-detail-row">
                            Notional: ${(trade.entry_price * trade.quantity).toLocaleString()} → ${trade.exit_price ? (trade.exit_price * trade.quantity).toLocaleString() : 'N/A'}
                          </div>
                          {exitTime && (
                            <div className="trade-detail-row">
                              Holding time: {Math.floor((exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60))}H {Math.floor(((exitTime.getTime() - entryTime.getTime()) % (1000 * 60 * 60)) / (1000 * 60))}M
                            </div>
                          )}

                          <div className="trade-pnl">
                            <span className="pnl-label">NET P&L:</span>
                            <span className={`pnl-value ${trade.realized_pnl && trade.realized_pnl >= 0 ? 'profit' : 'loss'}`}>
                              {trade.realized_pnl && trade.realized_pnl >= 0 ? '+' : ''}${trade.realized_pnl?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )
            ) : selectedTab === 'chat' ? (
              decisionLogs.length === 0 ? (
                <div className="no-data-message">No model decisions yet</div>
              ) : (
                decisionLogs
                  .filter(d => selectedModel === 'all' || d.modelId.toString() === selectedModel)
                  .map((decision) => {
                    const model = models.find(m => m.id === decision.modelId);
                    const decisionTime = new Date(decision.timestamp);
                    const output = decision.outputJson || {};

                    // Get decision icon based on type
                    const getDecisionIcon = (type: string, side?: string) => {
                      if (type === 'LONG') return '🟢';
                      if (type === 'SHORT') return '🔴';
                      if (type === 'CLOSE') return '⚪';
                      return '⏸️';
                    };

                    return (
                      <div key={decision.id} className="trade-item">
                        <div className="trade-header">
                          <div className="trade-info">
                            <span className="model-icon">{MODEL_LOGOS[model?.name || ''] || '⚪'}</span>
                            <span className="model-name-inline">{model?.name || 'Unknown'}</span>
                            <span> → </span>
                            <span className="trade-symbol">{decision.symbol || 'N/A'}</span>
                            <span> </span>
                            <span className={`trade-side ${decision.decisionType.toLowerCase()}`}>{decision.decisionType}</span>
                            <span> {getDecisionIcon(decision.decisionType, decision.symbol || undefined)}</span>
                          </div>
                          <span className="trade-time">
                            {decisionTime.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })},{' '}
                            {decisionTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>

                        <div className="trade-details">
                          {decision.decisionType !== 'HOLD' && decision.decisionType !== 'CLOSE' && (
                            <>
                              {output.entryPrice || output.entry_price ? (
                                <div className="trade-detail-row">
                                  入场价: ${Number(output.entryPrice || output.entry_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                              ) : null}
                              {output.quantity ? (
                                <div className="trade-detail-row">
                                  数量: {output.quantity} {decision.symbol}
                                </div>
                              ) : null}
                              {output.leverage ? (
                                <div className="trade-detail-row">
                                  杠杆: {output.leverage}x
                                </div>
                              ) : null}
                              {output.profit_target || output.profitTarget ? (
                                <div className="trade-detail-row">
                                  止盈: ${Number(output.profit_target || output.profitTarget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                              ) : null}
                              {output.stop_loss || output.stopLoss ? (
                                <div className="trade-detail-row">
                                  止损: ${Number(output.stop_loss || output.stopLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                              ) : null}
                            </>
                          )}

                          {decision.reasoning && (
                            <div className="trade-detail-row" style={{ marginTop: '8px', fontStyle: 'italic', color: '#666' }}>
                              理由: "{decision.reasoning}"
                            </div>
                          )}

                          {output.confidence ? (
                            <div className="trade-detail-row" style={{ marginTop: '4px' }}>
                              信心度: {output.confidence}%
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Live;
