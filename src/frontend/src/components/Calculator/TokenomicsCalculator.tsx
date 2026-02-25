import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useTokenomicsCalculator } from '@/hooks/useTokenomicsCalculator';
import type { AllocationCategory } from '@/hooks/useTokenomicsCalculator';
import { AllocationRow } from './AllocationRow';
import AllocationPieChart from './AllocationPieChart';
import VestingTimelineChart from './VestingTimelineChart';
import SummaryTable from './SummaryTable';
import { SaveSessionModal } from './SaveSessionModal';
import { LoadSessionModal } from './LoadSessionModal';
import ExportButton from './ExportButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';

function formatTokenAmount(amount: number): string {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(3) + 'B';
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(3) + 'M';
  if (amount >= 1_000) return (amount / 1_000).toFixed(3) + 'K';
  return amount.toFixed(0);
}

function formatSupplyDisplay(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

interface VestingDataPoint {
  month: number;
  date: string;
  totalUnlocked: number;
  percentUnlocked: number;
}

const TokenomicsCalculator: React.FC = () => {
  const {
    totalSupply,
    setTotalSupply,
    categories,
    setCategories,
    updateCategory,
    totalPercentage,
    isValid,
    tokenCounts,
    timelineData,
    pieData,
    resetToDefaults,
  } = useTokenomicsCalculator();

  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [supplyInput, setSupplyInput] = useState(totalSupply.toString());
  const [loadedSessionName, setLoadedSessionName] = useState<string | null>(null);

  const calculatorRef = useRef<HTMLDivElement>(null);

  const handleSupplyChange = (val: string) => {
    setSupplyInput(val);
    const parsed = parseFloat(val.replace(/,/g, ''));
    if (!isNaN(parsed) && parsed > 0) setTotalSupply(parsed);
  };

  const handleLoadSession = useCallback(
    (supply: number, cats: AllocationCategory[], sessionName: string) => {
      setTotalSupply(supply);
      setSupplyInput(supply.toString());
      setCategories(cats);
      setLoadedSessionName(sessionName);
    },
    [setTotalSupply, setCategories]
  );

  const handleReset = () => {
    resetToDefaults();
    setSupplyInput('1000000000');
    setLoadedSessionName(null);
  };

  // Build vesting schedule data for export (month-by-month from timelineData)
  const vestingScheduleData = useMemo((): VestingDataPoint[] => {
    return timelineData.map((point) => {
      const month = point.month;
      const totalUnlocked = categories.reduce((sum, cat) => {
        const val = point[cat.id];
        return sum + (typeof val === 'number' ? val : 0);
      }, 0);
      const date = new Date();
      date.setMonth(date.getMonth() + month);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return {
        month,
        date: dateStr,
        totalUnlocked,
        percentUnlocked: totalSupply > 0 ? (totalUnlocked / totalSupply) * 100 : 0,
      };
    });
  }, [timelineData, categories, totalSupply]);

  const maxVesting = Math.max(...categories.map((c) => c.vestingMonths), 0);
  const maxCliff = Math.max(...categories.map((c) => c.cliffMonths), 0);
  const totalAllocatedTokens = (totalSupply * totalPercentage) / 100;

  // Build timeline data keyed by category name for VestingTimelineChart
  const timelineDataByName = useMemo(() => {
    return timelineData.map((point) => {
      const named: Record<string, number | string> = { month: point.month };
      categories.forEach((cat) => {
        named[cat.name] = point[cat.id] ?? 0;
      });
      return named;
    });
  }, [timelineData, categories]);

  return (
    <section id="calculator" className="py-24 bg-navy-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal/30 bg-teal/10 text-teal text-xs font-medium uppercase tracking-wider mb-4">
            Interactive Tool
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Tokenomics Calculator
          </h2>
          <p className="text-foreground/50 max-w-xl mx-auto">
            Model your token distribution, vesting schedules, and unlock timelines in real time.
          </p>
        </div>

        {/* Loaded session banner */}
        {loadedSessionName && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border border-teal/30 bg-teal/10">
            <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-foreground/70">Loaded session: </span>
              <span className="text-sm font-semibold text-teal truncate">{loadedSessionName}</span>
            </div>
            <ExportButton
              sessionName={loadedSessionName}
              totalSupply={totalSupply}
              categories={categories}
              vestingData={vestingScheduleData}
              containerRef={calculatorRef}
            />
            <button
              onClick={handleReset}
              className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors flex-shrink-0 ml-2"
            >
              Clear
            </button>
          </div>
        )}

        <div ref={calculatorRef} className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Left panel: Inputs */}
          <div className="xl:col-span-2 space-y-6">
            {/* Total Supply */}
            <div className="card-dark rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Total Token Supply
                </h3>
                <span className="text-teal font-mono text-sm font-bold">
                  {formatSupplyDisplay(totalSupply)}
                </span>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground/50 uppercase tracking-wider">
                  Supply Amount
                </Label>
                <Input
                  type="number"
                  value={supplyInput}
                  onChange={(e) => handleSupplyChange(e.target.value)}
                  min={1}
                  className="bg-navy border-navy-border text-foreground focus:border-teal font-mono"
                  placeholder="1000000000"
                />
              </div>
            </div>

            {/* Allocation Categories */}
            <div className="card-dark rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Allocation Categories
                </h3>
                <div
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isValid
                      ? 'bg-teal/15 text-teal'
                      : 'bg-destructive/15 text-destructive'
                  }`}
                >
                  {isValid ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  {totalPercentage.toFixed(1)}%
                </div>
              </div>

              {!isValid && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive/90">
                    Allocations must sum to exactly 100%. Currently at{' '}
                    <strong>{totalPercentage.toFixed(1)}%</strong>.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {categories.map((cat) => (
                  <AllocationRow
                    key={cat.id}
                    category={cat}
                    tokenCount={tokenCounts[cat.id] || 0}
                    onUpdate={updateCategory}
                  />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setSaveOpen(true)}
                className="flex-1 bg-teal text-navy hover:bg-teal-light font-semibold"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Session
              </Button>
              <Button
                variant="outline"
                onClick={() => setLoadOpen(true)}
                className="flex-1 border-navy-border text-foreground/70 hover:text-foreground hover:border-teal/50"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Load Session
              </Button>
              <Button
                variant="ghost"
                onClick={handleReset}
                className="text-foreground/40 hover:text-foreground/70"
                title="Reset to defaults"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right panel: Charts & Table */}
          <div className="xl:col-span-3 space-y-6">
            {/* Summary Statistics */}
            <div data-export-section="summary-statistics" className="card-dark rounded-xl p-6">
              <h3 className="font-display text-base font-semibold text-foreground mb-4">
                Summary Statistics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Total Supply', value: formatTokenAmount(totalSupply) },
                  { label: 'Total Allocated', value: formatTokenAmount(totalAllocatedTokens) },
                  { label: 'Categories', value: categories.length.toString() },
                  { label: '% Allocated', value: totalPercentage.toFixed(1) + '%' },
                  { label: 'Max Vesting', value: maxVesting + ' mo' },
                  { label: 'Max Cliff', value: maxCliff + ' mo' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-navy rounded-lg p-3 border border-navy-border">
                    <p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-base font-bold text-teal font-mono">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="bg-navy-card border border-navy-border w-full">
                <TabsTrigger
                  value="charts"
                  className="flex-1 data-[state=active]:bg-teal data-[state=active]:text-navy font-medium"
                >
                  Charts
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="flex-1 data-[state=active]:bg-teal data-[state=active]:text-navy font-medium"
                >
                  Timeline
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className="flex-1 data-[state=active]:bg-teal data-[state=active]:text-navy font-medium"
                >
                  Summary
                </TabsTrigger>
                <TabsTrigger
                  value="schedule"
                  className="flex-1 data-[state=active]:bg-teal data-[state=active]:text-navy font-medium"
                >
                  Schedule
                </TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="mt-4">
                <div className="card-dark rounded-xl p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    Token Allocation
                  </h3>
                  <AllocationPieChart categories={categories} totalSupply={totalSupply} />
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="mt-4">
                <div className="card-dark rounded-xl p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    Vesting &amp; Unlock Timeline
                  </h3>
                  <VestingTimelineChart data={timelineDataByName} categories={categories} />
                </div>
              </TabsContent>

              <TabsContent value="table" className="mt-4">
                <div className="card-dark rounded-xl p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    Allocation Summary
                  </h3>
                  <SummaryTable categories={categories} totalSupply={totalSupply} />
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="mt-4">
                <div className="card-dark rounded-xl p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    Vesting Schedule
                  </h3>
                  <div data-export-section="vesting-schedule-table" className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-navy-border">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                            Month
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                            Total Unlocked
                          </th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                            % Unlocked
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {vestingScheduleData.map((row, index) => (
                          <tr
                            key={row.month}
                            className={`border-b border-navy-border/50 hover:bg-teal/5 transition-colors ${
                              index % 2 === 0 ? 'bg-navy/30' : ''
                            }`}
                          >
                            <td className="py-2.5 px-4 text-foreground/60">{row.month}</td>
                            <td className="py-2.5 px-4 text-foreground/60">{row.date}</td>
                            <td className="py-2.5 px-4 text-right text-teal font-mono">
                              {formatTokenAmount(row.totalUnlocked)}
                            </td>
                            <td className="py-2.5 px-4 text-right text-foreground/60">
                              {row.percentUnlocked.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SaveSessionModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        totalSupply={totalSupply}
        categories={categories}
      />
      <LoadSessionModal
        open={loadOpen}
        onClose={() => setLoadOpen(false)}
        onLoad={handleLoadSession}
      />
    </section>
  );
};

export default TokenomicsCalculator;
