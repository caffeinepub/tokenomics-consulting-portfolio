import { useIsAdmin } from '../../hooks/useAdminQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldX, ArrowLeft } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  onBack?: () => void;
}

export function AdminGuard({ children, onBack }: AdminGuardProps) {
  const { identity } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const { data: isAdmin, isLoading, isFetched } = useIsAdmin();

  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();

  if (!identity || isAnonymous) {
    return null;
  }

  // Show spinner while the actor is being set up or the admin query is in flight
  if (actorFetching || isLoading || !isFetched) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-teal animate-spin" />
          <p className="text-foreground/50 text-sm font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="card-dark rounded-2xl p-8 shadow-card text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-5">
              <ShieldX className="w-8 h-8 text-destructive" />
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-destructive/10 border-destructive/30 text-destructive mb-4">
              Access Denied
            </span>
            <h2 className="font-display font-bold text-2xl text-foreground mb-3">
              Admin Only
            </h2>
            <p className="text-foreground/60 text-sm leading-relaxed mb-8">
              You do not have administrator privileges to access this panel. This area is restricted
              to authorized administrators only.
            </p>
            {onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full border-navy-border text-foreground/60 hover:text-foreground hover:border-teal/40 rounded-xl h-11"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
