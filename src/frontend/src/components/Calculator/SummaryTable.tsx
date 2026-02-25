import React from 'react';
import type { AllocationCategory } from '@/hooks/useTokenomicsCalculator';

interface SummaryTableProps {
  categories: AllocationCategory[];
  totalSupply: number;
}

function formatTokenAmount(amount: number): string {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(3) + 'B';
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(3) + 'M';
  if (amount >= 1_000) return (amount / 1_000).toFixed(3) + 'K';
  return amount.toFixed(0);
}

const UNLOCK_LABELS: Record<string, { label: string; className: string }> = {
  immediate: {
    label: 'Immediate',
    className: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
  },
  linear_monthly: {
    label: 'Linear Monthly',
    className: 'bg-teal/15 text-teal border border-teal/30',
  },
  quarterly: {
    label: 'Quarterly',
    className: 'bg-gold/15 text-gold border border-gold/30',
  },
};

const SummaryTable: React.FC<SummaryTableProps> = ({ categories, totalSupply }) => {
  return (
    <div data-export-section="allocation-categories-table" className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-navy-border">
            <th className="text-left py-3 px-4 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Category
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Allocation %
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Tokens
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Cliff
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Vesting
            </th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Unlock Type
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => {
            const tokens = (totalSupply * cat.percentage) / 100;
            const unlockInfo = UNLOCK_LABELS[cat.unlockType] ?? {
              label: cat.unlockType,
              className: 'bg-foreground/10 text-foreground/60 border border-foreground/20',
            };
            return (
              <tr
                key={cat.id}
                className={`border-b border-navy-border/50 hover:bg-teal/5 transition-colors ${
                  index % 2 === 0 ? 'bg-navy/20' : ''
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-sm text-foreground">{cat.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-foreground/70">
                  {cat.percentage.toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-right text-teal font-mono">
                  {formatTokenAmount(tokens)}
                </td>
                <td className="py-3 px-4 text-right text-foreground/60">
                  {cat.cliffMonths} mo
                </td>
                <td className="py-3 px-4 text-right text-foreground/60">
                  {cat.vestingMonths} mo
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${unlockInfo.className}`}
                  >
                    {unlockInfo.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SummaryTable;
