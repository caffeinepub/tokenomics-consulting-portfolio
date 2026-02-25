import { AuthGuard } from '../AuthGuard';
import { AdminGuard } from './AdminGuard';
import { AdminPanel } from './AdminPanel';
import { Navigation } from '../Navigation';

interface AdminRouteProps {
  onBack: () => void;
}

export function AdminRoute({ onBack }: AdminRouteProps) {
  return (
    <AuthGuard>
      <div className="dark min-h-screen bg-navy text-foreground">
        <Navigation onAdminClick={undefined} currentView="admin" onNavigateHome={onBack} />
        <main className="pt-16">
          <AdminGuard onBack={onBack}>
            <AdminPanel />
          </AdminGuard>
        </main>
      </div>
    </AuthGuard>
  );
}
