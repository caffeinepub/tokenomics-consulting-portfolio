import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import type { VestingChartDataPoint } from '@/hooks/useVestingCalculator';

interface Props {
  data: VestingChartDataPoint[];
  totalTokens: number;
  cliffPeriod: number;
}

function formatTokens(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: VestingChartDataPoint }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div className="card-dark rounded-lg p-3 text-xs shadow-card border border-navy-border">
      <p className="font-semibold text-foreground mb-1">{d.label}</p>
      <p className="text-teal">
        Cumulative: <span className="font-mono font-bold">{formatTokens(d.cumulative)}</span>
      </p>
      {d.monthly > 0 && (
        <p className="text-foreground/60">
          This month: <span className="font-mono">{formatTokens(d.monthly)}</span>
        </p>
      )}
    </div>
  );
}

export function VestingTimelineChartSingle({ data, totalTokens, cliffPeriod }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-foreground/40 text-sm">
        Enter valid inputs to see the vesting timeline
      </div>
    );
  }

  const cliffDataPoint = data.find((d) => d.month === cliffPeriod);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="vestingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 240)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'oklch(0.60 0.02 240)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatTokens}
            tick={{ fill: 'oklch(0.60 0.02 240)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          {cliffPeriod > 0 && cliffDataPoint && (
            <ReferenceLine
              x={cliffDataPoint.label}
              stroke="oklch(0.78 0.16 75)"
              strokeDasharray="4 4"
              label={{
                value: 'Cliff End',
                position: 'insideTopRight',
                fill: 'oklch(0.78 0.16 75)',
                fontSize: 10,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="#2dd4bf"
            strokeWidth={2}
            fill="url(#vestingGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#2dd4bf', stroke: 'oklch(0.12 0.01 240)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
