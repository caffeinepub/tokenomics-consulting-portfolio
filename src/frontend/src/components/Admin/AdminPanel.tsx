import { useListApprovals, useSetApproval } from '../../hooks/useAdminQueries';
import { ApprovalStatus } from '../../backend';
import { Principal } from '@dfinity/principal';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

function truncatePrincipal(principal: Principal): string {
  const str = principal.toString();
  if (str.length <= 20) return str;
  return `${str.slice(0, 10)}...${str.slice(-6)}`;
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  if (status === ApprovalStatus.approved) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal/10 border border-teal/30 text-teal">
        <CheckCircle className="w-3 h-3" />
        Approved
      </span>
    );
  }
  if (status === ApprovalStatus.rejected) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/10 border border-destructive/30 text-destructive">
        <XCircle className="w-3 h-3" />
        Revoked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gold/10 border border-gold/30 text-gold">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  );
}

export function AdminPanel() {
  const { data: approvals, isLoading, error, refetch, isFetching } = useListApprovals();
  const setApproval = useSetApproval();

  const handleApprove = (principal: Principal) => {
    setApproval.mutate({ user: principal, status: ApprovalStatus.approved });
  };

  const handleRevoke = (principal: Principal) => {
    setApproval.mutate({ user: principal, status: ApprovalStatus.rejected });
  };

  const pendingCount = approvals?.filter((a) => a.status === ApprovalStatus.pending).length ?? 0;
  const approvedCount = approvals?.filter((a) => a.status === ApprovalStatus.approved).length ?? 0;
  const revokedCount = approvals?.filter((a) => a.status === ApprovalStatus.rejected).length ?? 0;

  return (
    <div className="min-h-screen bg-navy px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-teal-gold flex items-center justify-center">
              <Users className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground">Admin Panel</h1>
              <p className="text-foreground/50 text-sm">Manage user access approvals</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-navy-border text-foreground/60 hover:text-teal hover:border-teal/40"
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card-dark rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-gold">{pendingCount}</p>
            <p className="text-foreground/50 text-xs mt-1">Pending</p>
          </div>
          <div className="card-dark rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-teal">{approvedCount}</p>
            <p className="text-foreground/50 text-xs mt-1">Approved</p>
          </div>
          <div className="card-dark rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-destructive">{revokedCount}</p>
            <p className="text-foreground/50 text-xs mt-1">Revoked</p>
          </div>
        </div>

        {/* Table */}
        <div className="card-dark rounded-2xl overflow-hidden shadow-card">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-teal animate-spin mr-3" />
              <span className="text-foreground/50 text-sm">Loading users...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-destructive text-sm">
                Failed to load approvals. You may not have admin access.
              </p>
            </div>
          ) : !approvals || approvals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Users className="w-10 h-10 text-foreground/20" />
              <p className="text-foreground/40 text-sm">No users have requested access yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-navy-border hover:bg-transparent">
                  <TableHead className="text-foreground/50 font-semibold">Principal</TableHead>
                  <TableHead className="text-foreground/50 font-semibold">Status</TableHead>
                  <TableHead className="text-foreground/50 font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((approval) => {
                  const isActing =
                    setApproval.isPending &&
                    setApproval.variables?.user.toString() === approval.principal.toString();

                  return (
                    <TableRow
                      key={approval.principal.toString()}
                      className="border-navy-border hover:bg-navy-light/50 transition-colors"
                    >
                      <TableCell className="font-mono text-sm text-foreground/70">
                        <span title={approval.principal.toString()}>
                          {truncatePrincipal(approval.principal)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={approval.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {approval.status !== ApprovalStatus.approved && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(approval.principal)}
                              disabled={isActing || setApproval.isPending}
                              className="bg-teal text-navy hover:bg-teal-light font-semibold h-8 text-xs px-3"
                            >
                              {isActing && setApproval.variables?.status === ApprovalStatus.approved ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : null}
                              {approval.status === ApprovalStatus.rejected ? 'Re-approve' : 'Approve'}
                            </Button>
                          )}
                          {approval.status !== ApprovalStatus.rejected && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevoke(approval.principal)}
                              disabled={isActing || setApproval.isPending}
                              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive h-8 text-xs px-3"
                            >
                              {isActing && setApproval.variables?.status === ApprovalStatus.rejected ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : null}
                              Revoke
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
