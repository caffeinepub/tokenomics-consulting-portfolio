import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { TrendingUp, Shield, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function LoginPage() {
  const { login, isLoggingIn, isInitializing, loginError } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogin = async () => {
    try {
      // Do NOT clear query cache before login. The actor will be recreated
      // automatically when the identity changes, and queries will refetch
      // with the new authenticated principal. Clearing here would cause a
      // race condition where the new identity's admin status might not be
      // fetched before the ApprovalGuard checks it.
      await login();
    } catch (error: unknown) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-teal/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl gradient-teal-gold flex items-center justify-center mb-4 shadow-teal">
            <TrendingUp className="w-8 h-8 text-navy" />
          </div>
          <h1 className="font-display font-bold text-3xl text-gradient-teal-gold mb-2">
            Openomics
          </h1>
          <p className="text-foreground/50 text-sm text-center">
            Professional Tokenomics Consulting Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="card-dark rounded-2xl p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-teal" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-foreground">
                Secure Access
              </h2>
              <p className="text-foreground/50 text-xs">
                Identity-verified login required
              </p>
            </div>
          </div>

          <p className="text-foreground/60 text-sm mb-6 leading-relaxed">
            This platform is restricted to approved users. Sign in with your Internet Identity to
            request or verify access.
          </p>

          {loginError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {loginError.message === 'User is already authenticated'
                ? 'Already authenticated. Please wait...'
                : loginError.message}
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={isLoggingIn || isInitializing}
            className="w-full bg-teal text-navy hover:bg-teal-light font-semibold h-12 text-base rounded-xl transition-all duration-200 shadow-teal"
          >
            {isLoggingIn || isInitializing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isInitializing ? 'Initializing...' : 'Connecting...'}
              </>
            ) : (
              'Login with Internet Identity'
            )}
          </Button>

          <p className="text-center text-foreground/30 text-xs mt-4">
            Supports passkeys, Google, Apple, and Microsoft accounts
          </p>
        </div>

        {/* Info note */}
        <p className="text-center text-foreground/30 text-xs mt-6">
          New users will be placed in a pending queue for admin approval.
        </p>
      </div>
    </div>
  );
}
