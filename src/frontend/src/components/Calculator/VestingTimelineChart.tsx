import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AllocationCategory } from '@/hooks/useTokenomicsCalculator';

interface VestingTimelineChartProps {
  data: Record<string, number | string>[];
  categories: AllocationCategory[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-card border border-navy-border rounded-lg px-4 py-3 shadow-card max-w-xs">
        <div className="text-xs text-foreground/50 mb-2 font-medium">Month {label}</div>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-foreground/70">{entry.name}</span>
            </div>
            <span className="font-semibold" style={{ color: entry.color }}>
              {formatYAxis(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const VestingTimelineChart: React.FC<VestingTimelineChartProps> = ({ data, categories }) => {
  if (!data || data.length === 0) {
    return (
      <div
        data-export-section="vesting-timeline-chart"
        className="flex items-center justify-center h-64 text-foreground/40"
      >
        <p>No vesting data to display</p>
      </div>
    );
  }

  return (
    <div data-export-section="vesting-timeline-chart" className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            {categories.map((cat) => (
              <linearGradient key={cat.id} id={`grad-vtc-${cat.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={cat.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={cat.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 240)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'oklch(0.60 0.02 240)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'oklch(0.28 0.02 240)' }}
            label={{
              value: 'Months',
              position: 'insideBottom',
              offset: -2,
              fill: 'oklch(0.50 0.02 240)',
              fontSize: 11,
            }}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fill: 'oklch(0.60 0.02 240)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
            formatter={(value) => (
              <span style={{ color: 'oklch(0.70 0.02 240)' }}>{value}</span>
            )}
          />
          {categories.map((cat) => (
            <Area
              key={cat.id}
              type="monotone"
              dataKey={cat.name}
              name={cat.name}
              stroke={cat.color}
              strokeWidth={2}
              fill={`url(#grad-vtc-${cat.id})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VestingTimelineChart;
