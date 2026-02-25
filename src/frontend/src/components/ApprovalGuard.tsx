import { useApprovalStatus } from '../hooks/useApprovalStatus';
import { useIsAdmin } from '../hooks/useAdminQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ApprovalStatusScreen } from './ApprovalStatusScreen';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useActor } from '../hooks/useActor';

interface ApprovalGuardProps {
  children: React.ReactNode;
}

const APPROVAL_TIMEOUT_MS = 15_000;

export function ApprovalGuard({ children }: ApprovalGuardProps) {
  const { identity } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();

  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();

  // Check admin status FIRST - admins bypass all approval checks
  const {
    data: isAdmin,
    isLoading: adminLoading,
    isFetched: adminFetched,
  } = useIsAdmin();

  const {
    isApproved,
    isLoading: approvalLoading,
    isFetched: approvalFetched,
  } = useApprovalStatus();

  // While the actor is being set up with the authenticated identity, or while
  // either query is still in flight, we are in a "checking" state.
  const isChecking =
    actorFetching ||
    adminLoading ||
    approvalLoading ||
    (!adminFetched && !isAnonymous) ||
    (!approvalFetched && !isAnonymous);

  const [timedOut, setTimedOut] = useState(false);

  // Auto-request approval for new non-admin users once we know their status.
  const { actor } = useActor();
  useEffect(() => {
    if (actor && identity && !isAnonymous && approvalFetched && adminFetched && !isApproved && !isAdmin) {
      actor.requestApproval().catch(() => {
        // Ignore errors — user may already have a pending request
      });
    }
  }, [actor, identity, isAnonymous, approvalFetched, adminFetched, isApproved, isAdmin]);

  // Timeout fallback: if still checking after APPROVAL_TIMEOUT_MS, show pending screen
  useEffect(() => {
    if (!isChecking) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimedOut(true);
    }, APPROVAL_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isChecking]);

  // Show loading spinner while both queries are resolving (unless timed out)
  if (isChecking && !timedOut) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-teal animate-spin" />
          <p className="text-foreground/50 text-sm font-medium">Checking access...</p>
        </div>
      </div>
    );
  }

  // CRITICAL: Admin users bypass the approval check entirely — always grant access
  // This check must happen BEFORE the approval check to prevent admin regression
  if (adminFetched && isAdmin === true) {
    return <>{children}</>;
  }

  // Approved users get access
  if (approvalFetched && isApproved) {
    return <>{children}</>;
  }

  // Neither admin nor approved — show the pending/rejected status screen
  return <ApprovalStatusScreen status="pending" />;
}
