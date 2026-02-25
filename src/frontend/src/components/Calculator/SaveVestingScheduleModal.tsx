import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
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
import { toast } from 'sonner';
import { useSaveVestingSchedule } from '@/hooks/useVestingScheduleQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import type { VestingCalculatorState } from '@/hooks/useVestingCalculator';
import type { VestingSchedule } from '@/backend';

interface Props {
  open: boolean;
  onClose: () => void;
  calculatorState: VestingCalculatorState;
}

export function SaveVestingScheduleModal({ open, onClose, calculatorState }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { mutateAsync, isPending } = useSaveVestingSchedule();
  const { identity } = useInternetIdentity();

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a schedule name.');
      return;
    }
    if (!identity) {
      setError('You must be logged in to save a schedule.');
      return;
    }
    setError('');

    const schedule: VestingSchedule = {
      name: name.trim(),
      vestingType: calculatorState.vestingType,
      totalTokens: BigInt(Math.round(calculatorState.totalTokens)),
      tokenPrice: calculatorState.tokenPrice,
      cliffPeriod: BigInt(calculatorState.cliffPeriod),
      vestingDuration: BigInt(calculatorState.vestingDuration),
      startDate: BigInt(calculatorState.startDate.getTime()),
      admin: identity.getPrincipal(),
    };

    try {
      await mutateAsync(schedule);
      toast.success(`Schedule "${name.trim()}" saved successfully!`);
      setName('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save schedule.';
      setError(msg);
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-navy-card border-navy-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Save Vesting Schedule</DialogTitle>
          <DialogDescription className="text-foreground/50">
            Give this schedule a name so you can load it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-foreground/50 uppercase tracking-wider">
              Schedule Name
            </Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Team — 4yr/1yr cliff"
              className="bg-navy border-navy-border text-foreground focus:border-teal"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="rounded-lg bg-navy border border-navy-border p-3 space-y-1 text-xs text-foreground/50">
            <p><span className="text-foreground/70">Type:</span> {calculatorState.vestingType === 'cliffLinear' ? 'Cliff + Linear' : 'Graded/Stepped'}</p>
            <p><span className="text-foreground/70">Total Tokens:</span> {calculatorState.totalTokens.toLocaleString()}</p>
            <p><span className="text-foreground/70">Cliff:</span> {calculatorState.cliffPeriod} months</p>
            <p><span className="text-foreground/70">Duration:</span> {calculatorState.vestingDuration} months</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isPending}
            className="text-foreground/50 hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !name.trim()}
            className="bg-teal text-navy hover:bg-teal-light font-semibold"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
