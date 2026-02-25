import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveSession } from '@/hooks/useQueries';
import type { AllocationCategory } from '@/hooks/useTokenomicsCalculator';
import type { SavedSession, Recipient, Schedule } from '@/backend';

interface SaveSessionModalProps {
  open: boolean;
  onClose: () => void;
  totalSupply: number;
  categories: AllocationCategory[];
}

function categoryToRecipient(cat: AllocationCategory): Recipient {
  const schedule: Schedule = {
    id: cat.id,
    cliff: {
      cliffPeriod: BigInt(cat.cliffMonths),
      cliffPercentage: 0,
    },
    step: {
      stepPeriod: BigInt(cat.vestingMonths),
      stepFrequency: cat.unlockType === 'quarterly' ? BigInt(3) : BigInt(1),
      stepPercentage: 0,
    },
    numChunks: BigInt(cat.vestingMonths > 0 ? cat.vestingMonths : 1),
    lockPeriod: BigInt(cat.cliffMonths),
    isTokenLock: false,
    chunkSize: BigInt(0),
  };

  return {
    id: cat.id,
    name: cat.name,
    allocationPercentage: cat.percentage,
    schedule,
  };
}

export function SaveSessionModal({ open, onClose, totalSupply, categories }: SaveSessionModalProps) {
  const [sessionName, setSessionName] = useState('');
  const { mutate: saveSession, isPending, isError, error } = useSaveSession();

  const handleSave = () => {
    if (!sessionName.trim()) return;

    const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const session: SavedSession = {
      id,
      sessionName: sessionName.trim(),
      totalSupply: BigInt(Math.round(totalSupply)),
      decimals: BigInt(8),
      enableInflation: false,
      inflationStartYear: BigInt(new Date().getFullYear()),
      inflationRate: 0,
      recipients: categories.map(categoryToRecipient),
      timestamp: BigInt(Date.now()),
    };

    saveSession(session, {
      onSuccess: () => {
        setSessionName('');
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-navy-card border-navy-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Save Session</DialogTitle>
          <DialogDescription className="text-foreground/50">
            Save your current tokenomics configuration to retrieve it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm text-foreground/70">Session Name</Label>
            <Input
              placeholder="e.g. Project Alpha v1"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="bg-navy border-navy-border text-foreground focus:border-teal"
            />
          </div>
          {isError && (
            <p className="text-destructive text-sm">
              {error instanceof Error ? error.message : 'Failed to save session.'}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-foreground/60 hover:text-foreground">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!sessionName.trim() || isPending}
            className="bg-teal text-navy hover:bg-teal-light font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
