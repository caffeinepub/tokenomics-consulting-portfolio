import { useState } from 'react';
import { Save, TrendingUp, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VestingTimelineChartSingle } from './VestingTimelineChartSingle';
import { VestingDataTable } from './VestingDataTable';
import { SaveVestingScheduleModal } from './SaveVestingScheduleModal';
import { SavedVestingSchedulesPanel } from './SavedVestingSchedulesPanel';
import { useVestingCalculator } from '@/hooks/useVestingCalculator';
import { useIsAdmin } from '@/hooks/useAdminQueries';
import { Variant_graded_cliffLinear } from '@/backend';
import type { VestingCalculatorState } from '@/hooks/useVestingCalculator';

function formatTokensDisplay(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

export function VestingCalculator() {
  const {
    vestingType, setVestingType,
    totalTokens, setTotalTokens,
    tokenPrice, setTokenPrice,
    cliffPeriod, setCliffPeriod,
    vestingDuration, setVestingDuration,
    startDate, setStartDate,
    chartData,
    tableData,
    loadSchedule,
  } = useVestingCalculator();

  const { data: isAdmin } = useIsAdmin();
  const [saveOpen, setSaveOpen] = useState(false);

  const calculatorState: VestingCalculatorState = {
    vestingType,
    totalTokens,
    tokenPrice,
    cliffPeriod,
    vestingDuration,
    startDate,
  };

  const handleLoad = (state: Partial<VestingCalculatorState>) => {
    loadSchedule(state);
  };

  const startDateStr = startDate.toISOString().split('T')[0];

  return (
    <section id="vesting-calculator" className="py-24 bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-medium uppercase tracking-wider mb-4">
            <TrendingUp className="w-3 h-3" />
            Vesting Calculator
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Token Vesting Planner
          </h2>
          <p className="text-foreground/50 max-w-xl mx-auto">
            Model cliff and linear or graded vesting schedules with a real-time unlock timeline chart and month-by-month breakdown.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Left panel: Inputs */}
          <div className="xl:col-span-2 space-y-5">
            {/* Saved Schedules Panel */}
            <SavedVestingSchedulesPanel onLoad={handleLoad} />

            {/* Inputs Card */}
            <div className="card-dark rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Schedule Parameters
                </h3>
                <span className="text-gold font-mono text-sm font-bold">
                  {formatTokensDisplay(totalTokens)} tokens
                </span>
              </div>

              {/* Vesting Type */}
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/50 uppercase tracking-wider">
                  Vesting Type
                </Label>
                <Select
                  value={vestingType}
                  onValueChange={(v) => setVestingType(v as Variant_graded_cliffLinear)}
                >
                  <SelectTrigger className="bg-navy border-navy-border text-foreground focus:border-teal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-navy-card border-navy-border text-foreground">
                    <SelectItem value={Variant_graded_cliffLinear.cliffLinear}>
                      Cliff + Linear
                    </SelectItem>
                    <SelectItem value={Variant_graded_cliffLinear.graded}>
                      Graded / Stepped
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Total Token Allocation */}
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/50 uppercase tracking-wider">
                  Total Token Allocation
                </Label>
                <Input
                  type="number"
                  value={totalTokens}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v >= 0) setTotalTokens(v);
                  }}
                  min={0}
                  className="bg-navy border-navy-border text-foreground focus:border-teal font-mono"
                  placeholder="10000000"
                />
              </div>

              {/* Token Price */}
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/50 uppercase tracking-wider">
                  Token Price (USD)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 text-sm font-mono">$</span>
                  <Input
                    type="number"
                    value={tokenPrice}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v >= 0) setTokenPrice(v);
                    }}
                    min={0}
                    step={0.001}
                    className="bg-navy border-navy-border text-foreground focus:border-teal font-mono pl-7"
                    placeholder="0.10"
                  />
                </div>
              </div>

              {/* Cliff Period */}
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/50 uppercase tracking-wider">
                  Cliff Period (months)
                </Label>
                <Input
                  type="number"
                  value={cliffPeriod}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 0) setCliffPeriod(v);
                  }}
                  min={0}
                  className="bg-navy border-navy-border text-foreground focus:border-teal font-mono"
                  placeholder="6"
                />
              </div>

              {/* Vesting Duration */}
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/50 uppercase tracking-wider">
                  Vesting Duration (months)
                </Label>
                <Input
                  type="number"
                  value={vestingDuration}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v > 0) setVestingDuration(v);
                  }}
                  min={1}
                  className="bg-navy border-navy-border text-foreground focus:border-teal font-mono"
                  placeholder="24"
                />
              </div>

              {/* Start Date */}
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/50 uppercase tracking-wider">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => {
                    const d = new Date(e.target.value);
                    if (!isNaN(d.getTime())) setStartDate(d);
                  }}
                  className="bg-navy border-navy-border text-foreground focus:border-teal font-mono"
                />
              </div>

              {/* Save Schedule (admin only) */}
              {isAdmin && (
                <Button
                  onClick={() => setSaveOpen(true)}
                  className="w-full bg-gold text-navy hover:bg-gold-light font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Schedule
                </Button>
              )}
            </div>
          </div>

          {/* Right panel: Chart & Table */}
          <div className="xl:col-span-3 space-y-5">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card-dark rounded-xl p-4 text-center">
                <p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">Total Tokens</p>
                <p className="font-display font-bold text-lg text-teal">{formatTokensDisplay(totalTokens)}</p>
              </div>
              <div className="card-dark rounded-xl p-4 text-center">
                <p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">Total Value</p>
                <p className="font-display font-bold text-lg text-gold">
                  ${(totalTokens * tokenPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="card-dark rounded-xl p-4 text-center">
                <p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">Total Months</p>
                <p className="font-display font-bold text-lg text-foreground">{cliffPeriod + vestingDuration}</p>
              </div>
            </div>

            {/* Chart & Table Tabs */}
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="bg-navy-card border border-navy-border w-full">
                <TabsTrigger
                  value="chart"
                  className="flex-1 data-[state=active]:bg-gold data-[state=active]:text-navy font-medium"
                >
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                  Timeline Chart
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className="flex-1 data-[state=active]:bg-gold data-[state=active]:text-navy font-medium"
                >
                  Monthly Breakdown
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="mt-4">
                <div className="card-dark rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-sm font-semibold text-foreground">
                      Cumulative Token Unlock Timeline
                    </h3>
                    <span className="text-xs text-foreground/40 bg-navy px-2 py-1 rounded-md border border-navy-border">
                      {vestingType === Variant_graded_cliffLinear.cliffLinear ? 'Cliff + Linear' : 'Graded/Stepped'}
                    </span>
                  </div>
                  <VestingTimelineChartSingle
                    data={chartData}
                    totalTokens={totalTokens}
                    cliffPeriod={cliffPeriod}
                  />
                  {cliffPeriod > 0 && (
                    <p className="text-xs text-foreground/40 mt-3 flex items-center gap-1.5">
                      <span className="inline-block w-4 border-t border-dashed border-gold/60" />
                      Gold dashed line marks end of {cliffPeriod}-month cliff period
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="table" className="mt-4">
                <div className="card-dark rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-sm font-semibold text-foreground">
                      Month-by-Month Breakdown
                    </h3>
                    <span className="text-xs text-foreground/40">
                      {tableData.length} months total
                    </span>
                  </div>
                  <VestingDataTable rows={tableData} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <SaveVestingScheduleModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        calculatorState={calculatorState}
      />
    </section>
  );
}
