import { useState } from 'react';
import { FolderOpen, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useGetAllVestingSchedules, useDeleteVestingSchedule } from '@/hooks/useVestingScheduleQueries';
import { useIsAdmin } from '@/hooks/useAdminQueries';
import type { VestingSchedule } from '@/backend';
import type { VestingCalculatorState } from '@/hooks/useVestingCalculator';
import { Variant_graded_cliffLinear } from '@/backend';

interface Props {
  onLoad: (state: Partial<VestingCalculatorState>) => void;
}

export function SavedVestingSchedulesPanel({ onLoad }: Props) {
  const { data: schedules = [], isLoading } = useGetAllVestingSchedules();
  const { data: isAdmin } = useIsAdmin();
  const { mutateAsync: deleteSchedule, isPending: isDeleting } = useDeleteVestingSchedule();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const handleLoad = (schedule: VestingSchedule) => {
    onLoad({
      vestingType: schedule.vestingType,
      totalTokens: Number(schedule.totalTokens),
      tokenPrice: schedule.tokenPrice,
      cliffPeriod: Number(schedule.cliffPeriod),
      vestingDuration: Number(schedule.vestingDuration),
      startDate: new Date(Number(schedule.startDate)),
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSchedule(deleteTarget);
    } catch {
      // error handled silently; query will not invalidate
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="card-dark rounded-xl overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-teal/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-teal" />
          <span className="font-display text-sm font-semibold text-foreground">
            Saved Schedules
          </span>
          {schedules.length > 0 && (
            <span className="text-xs bg-teal/15 text-teal px-2 py-0.5 rounded-full font-medium">
              {schedules.length}
            </span>
          )}
        </div>
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-foreground/40" />
        ) : (
          <ChevronUp className="w-4 h-4 text-foreground/40" />
        )}
      </button>

      {!collapsed && (
        <div className="px-5 pb-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-foreground/40 text-sm py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading schedules…
            </div>
          ) : schedules.length === 0 ? (
            <p className="text-foreground/40 text-xs py-2">
              No saved schedules yet. {isAdmin ? 'Save one using the button above.' : ''}
            </p>
          ) : (
            <div className="space-y-2">
              {schedules.map((schedule) => (
                <div
                  key={schedule.name}
                  className="flex items-center justify-between gap-3 rounded-lg bg-navy border border-navy-border px-3 py-2.5 hover:border-teal/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{schedule.name}</p>
                    <p className="text-xs text-foreground/50 mt-0.5">
                      {schedule.vestingType === Variant_graded_cliffLinear.cliffLinear
                        ? 'Cliff + Linear'
                        : 'Graded/Stepped'}
                      {' · '}
                      {Number(schedule.totalTokens).toLocaleString()} tokens
                      {' · '}
                      {Number(schedule.cliffPeriod)}mo cliff
                      {' · '}
                      {Number(schedule.vestingDuration)}mo vest
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLoad(schedule)}
                      className="h-7 px-2.5 text-xs text-teal hover:bg-teal/10 hover:text-teal"
                    >
                      Load
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(schedule.name)}
                        disabled={isDeleting}
                        className="h-7 w-7 p-0 text-foreground/30 hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-navy-card border-navy-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/50">
              Are you sure you want to delete <strong className="text-foreground">"{deleteTarget}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-navy-border text-foreground/70 hover:text-foreground bg-transparent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
