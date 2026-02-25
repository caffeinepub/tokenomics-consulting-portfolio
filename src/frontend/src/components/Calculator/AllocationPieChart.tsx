import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AllocationCategory } from '@/hooks/useTokenomicsCalculator';

interface AllocationPieChartProps {
  categories: AllocationCategory[];
  totalSupply: number;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: { color: string; tokens: number; name: string; value: number };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(3)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(3)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-navy-card border border-navy-border rounded-lg px-4 py-3 shadow-card">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="font-semibold text-sm text-foreground">{item.name}</span>
        </div>
        <div className="text-teal font-bold text-lg">{item.value.toFixed(1)}%</div>
        <div className="text-foreground/50 text-xs">{formatTokens(item.tokens)} tokens</div>
      </div>
    );
  }
  return null;
};

interface LegendPayloadItem {
  value: string;
  color: string;
  payload: { value: number; color: string };
}

const CustomLegend: React.FC<{ payload?: LegendPayloadItem[] }> = ({ payload }) => {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-foreground/60">{entry.value}</span>
          <span className="text-xs font-semibold" style={{ color: entry.color }}>
            {entry.payload.value.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
};

const AllocationPieChart: React.FC<AllocationPieChartProps> = ({ categories, totalSupply }) => {
  const data = categories
    .filter((cat) => cat.percentage > 0)
    .map((cat) => ({
      name: cat.name,
      value: cat.percentage,
      color: cat.color,
      tokens: (totalSupply * cat.percentage) / 100,
      id: cat.id,
    }));

  if (data.length === 0) {
    return (
      <div
        data-export-section="allocation-pie-chart"
        className="flex items-center justify-center h-64 text-foreground/40"
      >
        <p>No allocation data to display</p>
      </div>
    );
  }

  return (
    <div data-export-section="allocation-pie-chart" className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={entry.id}
                fill={entry.color}
                stroke="oklch(0.12 0.01 240)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationPieChart;
