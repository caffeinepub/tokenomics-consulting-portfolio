import type { AllocationCategory } from '@/hooks/useTokenomicsCalculator';

interface VestingDataPoint {
  month: number;
  date: string;
  totalUnlocked: number;
  percentUnlocked: number;
}

interface ExportCSVParams {
  sessionName: string;
  totalSupply: number;
  categories: AllocationCategory[];
  vestingData: VestingDataPoint[];
}

function formatTokenAmount(amount: number): string {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(3) + 'B';
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(3) + 'M';
  if (amount >= 1_000) return (amount / 1_000).toFixed(3) + 'K';
  return amount.toFixed(0);
}

function formatPercent(value: number): string {
  return value.toFixed(2) + '%';
}

function formatMonths(months: number): string {
  return months + ' mo';
}

function formatUnlockType(unlockType: string): string {
  switch (unlockType) {
    case 'linear_monthly':
      return 'Linear Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'immediate':
      return 'Immediate';
    default:
      return unlockType
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
  }
}

export function exportCSV({ sessionName, totalSupply, categories, vestingData }: ExportCSVParams): void {
  const rows: string[] = [];

  // ── SUMMARY STATISTICS ──────────────────────────────────────────────────────
  rows.push('SUMMARY STATISTICS');
  rows.push('');

  const totalAllocatedPct = categories.reduce((sum, c) => sum + c.percentage, 0);
  const totalAllocatedTokens = (totalSupply * totalAllocatedPct) / 100;
  const maxVesting = Math.max(...categories.map((c) => c.vestingMonths), 0);
  const maxCliff = Math.max(...categories.map((c) => c.cliffMonths), 0);

  rows.push(`Total Supply,${formatTokenAmount(totalSupply)}`);
  rows.push(`Total Allocated,${formatTokenAmount(totalAllocatedTokens)}`);
  rows.push(`Categories,${categories.length}`);
  rows.push(`% Allocated,${formatPercent(totalAllocatedPct)}`);
  rows.push(`Max Vesting,${formatMonths(maxVesting)}`);
  rows.push(`Max Cliff,${formatMonths(maxCliff)}`);
  rows.push('');

  // ── ALLOCATION CATEGORIES ────────────────────────────────────────────────────
  rows.push('ALLOCATION CATEGORIES');
  rows.push('');
  rows.push('Category,Allocation %,Tokens,Cliff,Vesting,Unlock Type');

  for (const cat of categories) {
    const tokens = (totalSupply * cat.percentage) / 100;
    const cliff = formatMonths(cat.cliffMonths);
    const vesting = formatMonths(cat.vestingMonths);
    const unlockType = formatUnlockType(cat.unlockType);
    const name = `"${cat.name}"`;
    rows.push(
      `${name},${formatPercent(cat.percentage)},${formatTokenAmount(tokens)},${cliff},${vesting},${unlockType}`
    );
  }
  rows.push('');

  // ── VESTING SCHEDULE ─────────────────────────────────────────────────────────
  rows.push('VESTING SCHEDULE');
  rows.push('');
  rows.push('Month,Date,Total Unlocked,% Unlocked');

  for (const point of vestingData) {
    rows.push(
      `${point.month},"${point.date}",${formatTokenAmount(point.totalUnlocked)},${formatPercent(point.percentUnlocked)}`
    );
  }

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sessionName.replace(/\s+/g, '_')}_tokenomics.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
