import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { VestingTableRow } from '@/hooks/useVestingCalculator';

interface Props {
  rows: VestingTableRow[];
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

function formatUSD(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export function VestingDataTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-foreground/40 text-sm">
        No data to display
      </div>
    );
  }

  return (
    <ScrollArea className="h-72 rounded-lg border border-navy-border">
      <Table>
        <TableHeader className="sticky top-0 bg-navy-card z-10">
          <TableRow className="border-navy-border hover:bg-transparent">
            <TableHead className="text-foreground/50 text-xs font-semibold uppercase tracking-wider w-16">Month</TableHead>
            <TableHead className="text-foreground/50 text-xs font-semibold uppercase tracking-wider">Date</TableHead>
            <TableHead className="text-foreground/50 text-xs font-semibold uppercase tracking-wider text-right">Monthly Unlock</TableHead>
            <TableHead className="text-foreground/50 text-xs font-semibold uppercase tracking-wider text-right">Cumulative Tokens</TableHead>
            <TableHead className="text-foreground/50 text-xs font-semibold uppercase tracking-wider text-right">Cumulative USD</TableHead>
            <TableHead className="text-foreground/50 text-xs font-semibold uppercase tracking-wider text-right">% Unlocked</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.month}
              className="border-navy-border hover:bg-teal/5 transition-colors"
            >
              <TableCell className="font-mono text-foreground/60 text-xs">{row.month}</TableCell>
              <TableCell className="text-foreground/80 text-xs font-medium">{row.date}</TableCell>
              <TableCell className="text-right font-mono text-xs text-teal">
                {row.monthlyUnlock > 0 ? formatTokens(row.monthlyUnlock) : '—'}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-foreground">
                {formatTokens(row.cumulativeTokens)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-gold">
                {formatUSD(row.cumulativeUSD)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-foreground/70">
                {row.percentUnlocked.toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
