import './PriceCard.css';

interface PriceCardProps {
  symbol: string;
  price: number;
  change24h: number;
  volume24h?: number;
}

const PriceCard: React.FC<PriceCardProps> = ({ symbol, price, change24h, volume24h }) => {
  const isPositive = change24h >= 0;
  const changeClass = isPositive ? 'positive' : 'negative';
  const changeSymbol = isPositive ? '+' : '';

  return (
    <div className="price-card">
      <div className="price-card-header">
        <div className="symbol-info">
          <div className="symbol-icon">{symbol[0]}</div>
          <span className="symbol-name">{symbol}</span>
        </div>
      </div>
      <div className="price-card-body">
        <div className="price">${price.toLocaleString()}</div>
        <div className={`change ${changeClass}`}>
          {changeSymbol}{change24h.toFixed(2)}%
        </div>
      </div>
      {volume24h && (
        <div className="price-card-footer">
          <span className="label">24h Vol:</span>
          <span className="value">${(volume24h / 1e6).toFixed(2)}M</span>
        </div>
      )}
    </div>
  );
};

export default PriceCard;
