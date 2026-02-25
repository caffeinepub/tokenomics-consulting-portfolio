import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { About } from './components/About';
import TokenomicsCalculator from './components/Calculator/TokenomicsCalculator';
import { VestingCalculator } from './components/Calculator/VestingCalculator';
import Contact from './components/Contact';
import { Footer } from './components/Footer';
import { AuthGuard } from './components/AuthGuard';
import { ApprovalGuard } from './components/ApprovalGuard';
import { AdminRoute } from './components/Admin/AdminRoute';
import { Toaster } from '@/components/ui/sonner';

type View = 'main' | 'admin';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('main');

  if (currentView === 'admin') {
    return (
      <div className="dark">
        <AdminRoute onBack={() => setCurrentView('main')} />
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-navy text-foreground">
      <AuthGuard>
        <ApprovalGuard>
          <Navigation
            onAdminClick={() => setCurrentView('admin')}
            currentView="main"
          />
          <main>
            <Hero />
            <Services />
            <About />
            <TokenomicsCalculator />
            <VestingCalculator />
            <Contact />
          </main>
          <Footer />
        </ApprovalGuard>
      </AuthGuard>
      <Toaster richColors position="top-right" />
    </div>
  );
}
