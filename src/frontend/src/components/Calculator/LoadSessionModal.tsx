import { useState } from 'react';
import { FolderOpen, Clock, Loader2, CheckCircle2, FileText, FileSpreadsheet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetAllSessions } from '@/hooks/useQueries';
import type { SavedSession, Recipient } from '@/backend';
import type { AllocationCategory, UnlockType } from '@/hooks/useTokenomicsCalculator';
import { exportPDF } from '@/utils/exportPDF';
import { exportCSV } from '@/utils/exportCSV';

const CATEGORY_COLORS: string[] = [
  '#2dd4bf',
  '#f59e0b',
  '#818cf8',
  '#34d399',
  '#fb923c',
  '#f472b6',
  '#60a5fa',
  '#a78bfa',
  '#4ade80',
  '#fbbf24',
];

function recipientToCategory(r: Recipient, index: number): AllocationCategory {
  // Determine unlock type from schedule parameters
  let unlockType: UnlockType;
  const stepFrequency = Number(r.schedule.step.stepFrequency);
  const stepPeriod = Number(r.schedule.step.stepPeriod);
  const numChunks = Number(r.schedule.numChunks);

  if (numChunks <= 1 && stepPeriod === 0) {
    unlockType = 'immediate';
  } else if (stepFrequency >= 3) {
    unlockType = 'quarterly';
  } else {
    unlockType = 'linear_monthly';
  }

  // Use vesting duration from numChunks * stepPeriod or lockPeriod
  const vestingMonths = stepPeriod > 0
    ? numChunks * stepPeriod
    : Number(r.schedule.lockPeriod);

  return {
    id: r.id,
    name: r.name,
    percentage: r.allocationPercentage,
    cliffMonths: Number(r.schedule.cliff.cliffPeriod),
    vestingMonths: vestingMonths,
    unlockType,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  };
}

// Generate vesting data from categories
function generateVestingData(
  totalSupply: number,
  categories: AllocationCategory[]
): Array<{ month: number; date: string; totalUnlocked: number; percentUnlocked: number }> {
  const maxMonths = Math.max(...categories.map((c) => c.cliffMonths + c.vestingMonths), 12);
  const data: Array<{ month: number; date: string; totalUnlocked: number; percentUnlocked: number }> = [];

  for (let month = 0; month <= maxMonths; month++) {
    let totalUnlocked = 0;

    categories.forEach((cat) => {
      const catTokens = (totalSupply * cat.percentage) / 100;

      if (cat.unlockType === 'immediate') {
        totalUnlocked += catTokens;
      } else if (month >= cat.cliffMonths) {
        const vestingMonthsPassed = month - cat.cliffMonths;
        if (cat.vestingMonths === 0) {
          totalUnlocked += catTokens;
        } else {
          const unlockedFraction = Math.min(1, vestingMonthsPassed / cat.vestingMonths);
          totalUnlocked += catTokens * unlockedFraction;
        }
      }
    });

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + month);
    data.push({
      month,
      date: startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      totalUnlocked,
      percentUnlocked: (totalUnlocked / totalSupply) * 100,
    });
  }

  return data;
}

interface LoadSessionModalProps {
  open: boolean;
  onClose: () => void;
  onLoad: (totalSupply: number, categories: AllocationCategory[], sessionName: string) => void;
}

export function LoadSessionModal({ open, onClose, onLoad }: LoadSessionModalProps) {
  const { data: sessions, isLoading } = useGetAllSessions();
  const [selected, setSelected] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedSessionData, setSelectedSessionData] = useState<{
    totalSupply: number;
    categories: AllocationCategory[];
    sessionName: string;
  } | null>(null);

  const handleLoad = () => {
    const session = sessions?.find((s) => s.id === selected);
    if (!session) return;
    const categories = session.recipients.map((r, i) => recipientToCategory(r, i));
    const totalSupply = Number(session.totalSupply);
    const sessionName = session.sessionName;

    // Store the session data for export
    setSelectedSessionData({ totalSupply, categories, sessionName });

    // Load into calculator
    onLoad(totalSupply, categories, sessionName);

    // Show export dialog
    setShowExportDialog(true);
  };

  const handleExportCSV = () => {
    if (!selectedSessionData) return;
    const vestingData = generateVestingData(selectedSessionData.totalSupply, selectedSessionData.categories);
    exportCSV({
      sessionName: selectedSessionData.sessionName,
      totalSupply: selectedSessionData.totalSupply,
      categories: selectedSessionData.categories,
      vestingData,
    });
  };

  const handleExportPDF = async () => {
    if (!selectedSessionData) return;
    const vestingData = generateVestingData(selectedSessionData.totalSupply, selectedSessionData.categories);
    await exportPDF({
      sessionName: selectedSessionData.sessionName,
      totalSupply: selectedSessionData.totalSupply,
      categories: selectedSessionData.categories,
      vestingData,
    });
  };

  const handleCloseExportDialog = () => {
    setShowExportDialog(false);
    setSelected(null);
    setSelectedSessionData(null);
    onClose();
  };

  const handleSessionClick = (sessionId: string) => {
    setSelected(sessionId);
  };

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  return (
    <>
      <Dialog open={open && !showExportDialog} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="bg-navy-card border-navy-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Load Session</DialogTitle>
            <DialogDescription className="text-foreground/50">
              Select a previously saved tokenomics configuration to load.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-teal" />
            </div>
          ) : !sessions || sessions.length === 0 ? (
            <div className="text-center py-8 text-foreground/40">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No saved sessions yet.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-72">
              <div className="space-y-2 pr-2">
                {sessions.map((session: SavedSession) => (
                  <button
                    type="button"
                    key={session.id}
                    onClick={() => handleSessionClick(session.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-all duration-150 ${
                      selected === session.id
                        ? 'border-teal bg-teal/10'
                        : 'border-navy-border hover:border-teal/40 hover:bg-teal/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-foreground">{session.sessionName}</div>
                      {selected === session.id && (
                        <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-foreground/40">
                      <Clock className="w-3 h-3" />
                      {new Date(Number(session.timestamp)).toLocaleDateString()}
                      <span className="mx-1">·</span>
                      Supply: {(Number(session.totalSupply) / 1_000_000_000).toFixed(2)}B
                      <span className="mx-1">·</span>
                      {session.recipients.length} categories
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={handleClose} className="text-foreground/60 hover:text-foreground">
              Cancel
            </Button>
            <Button
              onClick={handleLoad}
              disabled={!selected}
              className="bg-teal text-navy hover:bg-teal-light font-semibold"
            >
              Load Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Options Dialog */}
      <Dialog open={showExportDialog} onOpenChange={(v) => !v && handleCloseExportDialog()}>
        <DialogContent className="bg-navy-card border-navy-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Export Session</DialogTitle>
            <DialogDescription className="text-foreground/50">
              Choose your preferred export format for {selectedSessionData?.sessionName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Button
              onClick={handleExportPDF}
              className="w-full bg-teal text-navy hover:bg-teal-light font-semibold h-14 text-base justify-start gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-navy/20 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Export as PDF</div>
                <div className="text-xs text-navy/70 font-normal">Full visual report with charts and tables</div>
              </div>
            </Button>

            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="w-full border-teal/40 text-teal hover:bg-teal/10 hover:border-teal font-semibold h-14 text-base justify-start gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Export as CSV</div>
                <div className="text-xs text-foreground/50 font-normal">Raw data for spreadsheet analysis</div>
              </div>
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={handleCloseExportDialog} className="text-foreground/60 hover:text-foreground">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
