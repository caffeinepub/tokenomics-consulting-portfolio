import { ArrowDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  const scrollToCalculator = () => {
    document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/generated/hero-bg.dim_1920x1080.png')" }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-navy/80" />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/20 to-navy" />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(oklch(0.72 0.18 185) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.18 185) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal/30 bg-teal/10 text-teal text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          ICP & Web3 Tokenomics Specialist
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          {/* UPDATE: Replace with your name */}
          <span className="text-foreground">Your Name</span>
          <br />
          <span className="text-gradient-teal-gold">Tokenomics Architect</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          Designing token economies that align incentives, drive adoption, and sustain long-term
          value. Specializing in ICP, SNS governance, and cross-chain token models.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={scrollToCalculator}
            className="bg-teal text-navy hover:bg-teal-light font-semibold text-base px-8 glow-teal"
          >
            Try the Calculator
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToContact}
            className="border-gold/50 text-gold hover:bg-gold/10 hover:border-gold font-semibold text-base px-8"
          >
            Work With Me
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: '50+', label: 'Projects Analyzed' },
            { value: '$2B+', label: 'Token Value Modeled' },
            { value: '5+', label: 'Years Experience' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl font-bold text-teal">{stat.value}</div>
              <div className="text-xs text-foreground/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-5 h-5 text-foreground/30" />
      </div>
    </section>
  );
}
