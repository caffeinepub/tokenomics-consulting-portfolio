import { TrendingUp, Heart } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'tokenomics-consulting'
  );

  return (
    <footer className="bg-navy border-t border-navy-border py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-teal-gold flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-navy" />
            </div>
            <span className="font-display font-bold text-foreground/80">Openomics</span>
          </div>

          {/* Center */}
          <p className="text-sm text-foreground/40 text-center">
            © {year} Openomics. All rights reserved.
          </p>

          {/* Attribution */}
          <p className="text-sm text-foreground/40 flex items-center gap-1.5">
            Built with{' '}
            <Heart className="w-3.5 h-3.5 text-teal fill-teal" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:text-teal-light transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
