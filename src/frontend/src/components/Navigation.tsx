import { useState, useEffect } from 'react';
import { Menu, X, TrendingUp, LogOut, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useAdminQueries';
import { useQueryClient } from '@tanstack/react-query';

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Calculator', href: '#calculator' },
  { label: 'Vesting', href: '#vesting-calculator' },
  { label: 'Contact', href: '#contact' },
];

interface NavigationProps {
  onAdminClick?: () => void;
  currentView?: 'main' | 'admin';
  onNavigateHome?: () => void;
}

export function Navigation({ onAdminClick, currentView = 'main', onNavigateHome }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity, clear, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (currentView === 'admin' && onNavigateHome) {
      onNavigateHome();
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = async () => {
    setMobileOpen(false);
    // Clear all cached query data (including admin/approval status) before logging out
    // so the next login always fetches fresh data with the new authenticated principal.
    queryClient.clear();
    await clear();
  };

  const handleAdminClick = () => {
    setMobileOpen(false);
    if (onAdminClick) onAdminClick();
  };

  const handleLogoClick = () => {
    if (currentView === 'admin' && onNavigateHome) {
      onNavigateHome();
    } else {
      handleNavClick('#hero');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-navy/95 backdrop-blur-md border-b border-navy-border shadow-card'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-md gradient-teal-gold flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-navy" />
            </div>
            <span className="font-display font-bold text-lg text-gradient-teal-gold">
              Openomics
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {currentView === 'main' && NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-teal transition-colors rounded-md hover:bg-teal/5"
              >
                {link.label}
              </button>
            ))}

            {currentView === 'main' && (
              <Button
                size="sm"
                onClick={() => handleNavClick('#vesting-calculator')}
                className="ml-2 bg-teal text-navy hover:bg-teal-light font-semibold"
              >
                Try Vesting
              </Button>
            )}

            {/* Admin link — only for admins */}
            {isAdmin && onAdminClick && currentView === 'main' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAdminClick}
                className="ml-2 border-gold/40 text-gold hover:bg-gold/10 hover:border-gold font-semibold"
              >
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                Admin
              </Button>
            )}

            {currentView === 'admin' && onNavigateHome && (
              <Button
                size="sm"
                variant="outline"
                onClick={onNavigateHome}
                className="ml-2 border-navy-border text-foreground/60 hover:text-teal hover:border-teal/40"
              >
                ← Back to App
              </Button>
            )}

            {/* Logout */}
            {identity && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingIn}
                className="ml-1 text-foreground/50 hover:text-foreground hover:bg-navy-light"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span className="ml-1.5">Logout</span>
              </Button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-foreground/70 hover:text-teal transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy/98 backdrop-blur-md border-b border-navy-border">
          <div className="px-4 py-3 space-y-1">
            {currentView === 'main' && NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="w-full text-left px-4 py-3 text-sm font-medium text-foreground/70 hover:text-teal hover:bg-teal/5 rounded-md transition-colors"
              >
                {link.label}
              </button>
            ))}

            {isAdmin && onAdminClick && currentView === 'main' && (
              <button
                onClick={handleAdminClick}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gold hover:bg-gold/5 rounded-md transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </button>
            )}

            {currentView === 'admin' && onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="w-full text-left px-4 py-3 text-sm font-medium text-foreground/70 hover:text-teal hover:bg-teal/5 rounded-md transition-colors"
              >
                ← Back to App
              </button>
            )}

            {identity && (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm font-medium text-foreground/50 hover:text-foreground hover:bg-navy-light rounded-md transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
