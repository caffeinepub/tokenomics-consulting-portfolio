import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, XCircle, AlertTriangle, LogOut } from 'lucide-react';

interface ApprovalStatusScreenProps {
  /** If true, show a generic "not approved" screen. Pass specific status for tailored messages. */
  status?: 'pending' | 'rejected' | 'unknown';
}

export function ApprovalStatusScreen({ status = 'pending' }: ApprovalStatusScreenProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const configs = {
    pending: {
      icon: <Clock className="w-8 h-8 text-gold" />,
      iconBg: 'bg-gold/10 border-gold/20',
      title: 'Pending Approval',
      description:
        'Your account is awaiting admin review. You will gain access once an administrator approves your request.',
      note: 'This process typically takes 1–2 business days. Please check back later.',
      badgeClass: 'bg-gold/10 border-gold/30 text-gold',
      badgeText: 'Pending Review',
    },
    rejected: {
      icon: <XCircle className="w-8 h-8 text-destructive" />,
      iconBg: 'bg-destructive/10 border-destructive/20',
      title: 'Access Revoked',
      description:
        'Your access to this platform has been revoked by an administrator.',
      note: 'If you believe this is an error, please contact the platform administrator.',
      badgeClass: 'bg-destructive/10 border-destructive/30 text-destructive',
      badgeText: 'Access Revoked',
    },
    unknown: {
      icon: <AlertTriangle className="w-8 h-8 text-gold" />,
      iconBg: 'bg-gold/10 border-gold/20',
      title: 'Access Restricted',
      description:
        'You do not currently have access to this platform.',
      note: 'Please contact the platform administrator for assistance.',
      badgeClass: 'bg-gold/10 border-gold/30 text-gold',
      badgeText: 'No Access',
    },
  };

  const config = configs[status];

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-teal/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl gradient-teal-gold flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-navy" />
          </div>
          <span className="font-display font-bold text-xl text-gradient-teal-gold">
            Openomics
          </span>
        </div>

        {/* Status Card */}
        <div className="card-dark rounded-2xl p-8 shadow-card text-center">
          <div
            className={`w-16 h-16 rounded-2xl border ${config.iconBg} flex items-center justify-center mx-auto mb-5`}
          >
            {config.icon}
          </div>

          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.badgeClass} mb-4`}
          >
            {config.badgeText}
          </span>

          <h2 className="font-display font-bold text-2xl text-foreground mb-3">
            {config.title}
          </h2>

          <p className="text-foreground/60 text-sm leading-relaxed mb-4">
            {config.description}
          </p>

          <p className="text-foreground/40 text-xs leading-relaxed mb-8 px-4 py-3 rounded-lg bg-navy-light border border-navy-border">
            {config.note}
          </p>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-navy-border text-foreground/60 hover:text-foreground hover:border-teal/40 rounded-xl h-11"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
