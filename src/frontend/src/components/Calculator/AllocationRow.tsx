import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AllocationCategory, UnlockType } from '@/hooks/useTokenomicsCalculator';

interface AllocationRowProps {
  category: AllocationCategory;
  tokenCount: number;
  onUpdate: (id: string, updates: Partial<AllocationCategory>) => void;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

export function AllocationRow({ category, tokenCount, onUpdate }: AllocationRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl border transition-all duration-200"
      style={{ borderColor: expanded ? `${category.color}40` : 'oklch(0.28 0.02 240)' }}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 p-4">
        {/* Color dot */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: category.color }}
        />

        {/* Category name */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground">{category.name}</div>
          <div className="text-xs text-foreground/40 mt-0.5">{formatNumber(tokenCount)} tokens</div>
        </div>

        {/* Percentage input */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={category.percentage}
            onChange={(e) => onUpdate(category.id, { percentage: parseFloat(e.target.value) || 0 })}
            className="w-20 text-right bg-navy-card border-navy-border text-foreground focus:border-teal h-8 text-sm"
          />
          <span className="text-foreground/50 text-sm w-4">%</span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-md text-foreground/40 hover:text-teal hover:bg-teal/10 transition-colors"
          aria-label={expanded ? 'Collapse' : 'Expand vesting settings'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded vesting settings */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-navy-border/50 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground/50 uppercase tracking-wider">
                Cliff (months)
              </Label>
              <Input
                type="number"
                min={0}
                max={120}
                value={category.cliffMonths}
                onChange={(e) =>
                  onUpdate(category.id, { cliffMonths: parseInt(e.target.value) || 0 })
                }
                className="bg-navy-card border-navy-border text-foreground focus:border-teal h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground/50 uppercase tracking-wider">
                Vesting (months)
              </Label>
              <Input
                type="number"
                min={0}
                max={120}
                value={category.vestingMonths}
                onChange={(e) =>
                  onUpdate(category.id, { vestingMonths: parseInt(e.target.value) || 0 })
                }
                className="bg-navy-card border-navy-border text-foreground focus:border-teal h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground/50 uppercase tracking-wider">
                Unlock Schedule
              </Label>
              <Select
                value={category.unlockType}
                onValueChange={(val) =>
                  onUpdate(category.id, { unlockType: val as UnlockType })
                }
              >
                <SelectTrigger className="bg-navy-card border-navy-border text-foreground focus:border-teal h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy-card border-navy-border">
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="linear_monthly">Linear Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
