import { useMemo } from 'react';
import { Group } from '@visx/group';
import { Grid } from '@visx/grid';
import { LinePath } from '@visx/shape';
import { scaleTime, scaleLinear } from '@visx/scale';
import { curveLinear } from '@visx/curve';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { ParentSize } from '@visx/responsive';
import { mockModels } from '../../utils/mockData';
import './AccountValueChart.css';

// Chart margin - matching official SVG (translate 80, 70)
const margin = { top: 70, right: 200, bottom: 50, left: 80 };

// Generate realistic time series data matching official style
const generateHistoricalData = () => {
  const numPoints = 450; // More points for denser, sharper lines
  const now = Date.now();
  const hourMs = 3600000;

  const data: Array<{time: Date, [key: string]: number | Date}> = [];

  // Initialize model states - all start at 10000
  const modelStates = mockModels.map((model, index) => {
    return {
      name: model.name,
      value: 10000, // All start at 10000
      baseValue: 10000,
      volatility: 0.04 + Math.random() * 0.04, // Very high volatility
      trend: (Math.random() - 0.5) * 20, // Some models trend up, some down
    };
  });

  for (let i = 0; i < numPoints; i++) {
    const time = new Date(now - (numPoints - i) * hourMs);
    const point: any = { time };

    modelStates.forEach(state => {
      // Very weak mean reversion to allow extreme values
      const meanReversion = (state.baseValue - state.value) * 0.0005;

      // Large random changes
      const randomChange = (Math.random() - 0.5) * state.volatility * state.value;

      // Frequent large jumps
      let jump = 0;
      if (Math.random() < 0.15) {
        jump = (Math.random() - 0.5) * state.value * 0.12;
      }

      // Apply trend
      const trendEffect = state.trend;

      // Apply all changes
      state.value += randomChange + meanReversion + jump + trendEffect;

      // Constrain to range (4000 to 25000)
      state.value = Math.max(4000, Math.min(25000, state.value));

      point[state.name] = state.value;
    });

    data.push(point);
  }

  return data;
};

// Model colors
const modelColors: { [key: string]: string } = {
  'GPT 5': '#10a37f',
  'CLAUDE SONNET 4.5': '#ff6b35',
  'GEMINI 2.5 PRO': '#4285F4',
  'GROK 4': '#000000',
  'DEEPSEEK CHAT V3.1': '#4d6bfe',
  'QWEN3 MAX': '#8b5cf6',
  'BTC BUY&HOLD': '#5a5a5a',
};

interface ChartProps {
  width: number;
  height: number;
}

const Chart = ({ width, height }: ChartProps) => {
  const data = useMemo(() => {
    try {
      return generateHistoricalData();
    } catch (error) {
      console.error('Error generating historical data:', error);
      return [];
    }
  }, []);

  // Calculate dimensions (always calculate, for hooks consistency)
  const xMax = Math.max(0, width - margin.left - margin.right);
  const yMax = Math.max(0, height - margin.top - margin.bottom);

  // Accessor functions
  const getX = (d: any) => d.time;
  const getY = (modelName: string) => (d: any) => d[modelName];

  // Scales - always call hooks unconditionally
  const xScale = useMemo(
    () => {
      if (data.length === 0) return scaleTime({ range: [0, 100], domain: [new Date(), new Date()] });
      return scaleTime({
        range: [0, xMax],
        domain: [data[0].time, data[data.length - 1].time],
      });
    },
    [data, xMax]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        domain: [0, 25000], // Fixed domain for realistic scale
        nice: true,
      }),
    [yMax]
  );

  // After all hooks, do validation checks
  if (width <= 0 || height <= 0 || !data || data.length === 0 || xMax <= 0 || yMax <= 0) {
    return null;
  }

  const allValues = data.flatMap(d =>
    mockModels.map(model => d[model.name] as number)
  ).filter(v => typeof v === 'number' && !isNaN(v));

  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 25000;

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Grid - Fine dashed lines */}
        <Grid
          xScale={xScale}
          yScale={yScale}
          width={xMax}
          height={yMax}
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth={0.5}
          strokeDasharray="1,3"
          numTicksRows={6}
          numTicksColumns={3}
        />

        {/* Major grid lines - Solid lines at 0, 10000, 20000 */}
        <line
          x1={0}
          y1={yMax}
          x2={xMax}
          y2={yMax}
          stroke="rgba(0, 0, 0, 0.15)"
          strokeWidth={1}
        />
        <line
          x1={0}
          y1={yScale(10000)}
          x2={xMax}
          y2={yScale(10000)}
          stroke="rgba(0, 0, 0, 0.15)"
          strokeWidth={1}
        />
        <line
          x1={0}
          y1={yScale(20000)}
          x2={xMax}
          y2={yScale(20000)}
          stroke="rgba(0, 0, 0, 0.15)"
          strokeWidth={1}
        />

        {/* Lines for each model */}
        {mockModels.map((model) => {
          const isDashed = model.name === 'BTC BUY&HOLD';
          return (
            <LinePath
              key={model.id}
              data={data}
              x={d => xScale(getX(d)) ?? 0}
              y={d => yScale(getY(model.name)(d)) ?? 0}
              stroke={modelColors[model.name]}
              strokeWidth={2}
              strokeOpacity={1}
              strokeDasharray={isDashed ? '5,5' : undefined}
              curve={curveLinear}
            />
          );
        })}

        {/* End markers with labels and model names */}
        {mockModels.map((model) => {
          const lastPoint = data[data.length - 1];
          const x = xScale(lastPoint.time) ?? 0;
          const y = yScale(lastPoint[model.name] as number) ?? 0;
          const value = lastPoint[model.name] as number;
          const color = modelColors[model.name];
          const isBTC = model.name === 'BTC BUY&HOLD';

          return (
            <Group key={`marker-${model.id}`}>
              {/* Circle marker */}
              <circle
                cx={x}
                cy={y}
                r={4}
                fill={color}
                stroke="white"
                strokeWidth={1.5}
              />

              {/* Model name and value label */}
              <text
                x={x + 10}
                y={y - 8}
                fill={color}
                fontSize={11}
                fontWeight="700"
                fontFamily="'Courier New', monospace"
              >
                {model.name}
              </text>
              <text
                x={x + 10}
                y={y + 8}
                fill="#666"
                fontSize={10}
                fontWeight="600"
                fontFamily="'Courier New', monospace"
              >
                ${value.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </text>
            </Group>
          );
        })}

        {/* Axes - matching official style */}
        <AxisBottom
          top={yMax}
          scale={xScale}
          numTicks={8}
          stroke="rgba(0, 0, 0, 0.15)"
          tickStroke="rgba(0, 0, 0, 0.15)"
          strokeWidth={1}
          tickLabelProps={() => ({
            fill: '#666',
            fontSize: 10,
            fontFamily: "'Courier New', monospace",
            textAnchor: 'middle',
            dy: 10,
          })}
          tickFormat={(value) => {
            const date = value as Date;
            return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
              .getDate()
              .toString()
              .padStart(2, '0')} ${date
              .getHours()
              .toString()
              .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          }}
        />
        <AxisLeft
          scale={yScale}
          numTicks={6}
          stroke="rgba(0, 0, 0, 0.15)"
          tickStroke="rgba(0, 0, 0, 0.15)"
          strokeWidth={1}
          tickLabelProps={() => ({
            fill: '#666',
            fontSize: 11,
            fontFamily: "'Courier New', monospace",
            textAnchor: 'end',
            dx: -8,
          })}
          tickFormat={(value) =>
            `$${(value as number / 1000).toFixed(0)},000`
          }
        />
      </Group>
    </svg>
  );
};

const AccountValueChart = () => {
  return (
    <div className="account-value-chart">
      <ParentSize>
        {({ width, height }) => <Chart width={width} height={height} />}
      </ParentSize>
    </div>
  );
};

export default AccountValueChart;
