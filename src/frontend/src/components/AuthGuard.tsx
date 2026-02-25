import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { LoginPage } from './LoginPage';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AUTH_TIMEOUT_MS = 10_000;

export function AuthGuard({ children }: AuthGuardProps) {
  const { identity, isInitializing, loginStatus } = useInternetIdentity();
  const [timedOut, setTimedOut] = useState(false);

  // Determine if we are in a transitional state where we should show a spinner.
  // "logging-in" means the II popup is open / in progress — keep showing spinner.
  const isTransitioning = isInitializing || loginStatus === 'logging-in';

  useEffect(() => {
    if (!isTransitioning) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimedOut(true);
    }, AUTH_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isTransitioning]);

  // Show spinner while initializing or logging in (unless timed out)
  if (isTransitioning && !timedOut) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-teal animate-spin" />
          <p className="text-foreground/50 text-sm font-medium">
            {isInitializing ? 'Loading...' : 'Connecting...'}
          </p>
        </div>
      </div>
    );
  }

  // No authenticated identity — show login page
  if (!identity || identity.getPrincipal().isAnonymous()) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
