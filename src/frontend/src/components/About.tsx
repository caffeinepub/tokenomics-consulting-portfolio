import { CheckCircle2 } from 'lucide-react';

const HIGHLIGHTS = [
  'Deep ICP & SNS ecosystem expertise',
  'Economic modeling & game theory',
  'Cross-chain tokenomics experience',
  'Investor-ready documentation',
];

export function About() {
  return (
    <section id="about" className="py-24 bg-navy-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl gradient-teal-gold opacity-20 blur-xl" />
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border-2 border-teal/30">
                <img
                  src="/assets/generated/profile-placeholder.dim_400x400.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-navy-card border border-gold/30 rounded-xl px-4 py-3 shadow-card">
                <div className="font-display text-xl font-bold text-gold">5+</div>
                <div className="text-xs text-foreground/50">Years in Web3</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal/30 bg-teal/10 text-teal text-xs font-medium uppercase tracking-wider mb-6">
              About Me
            </div>
            {/* UPDATE: Replace with your name */}
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Hi, I'm{' '}
              <span className="text-gradient-teal-gold">Your Name</span>
            </h2>
            {/* UPDATE: Replace with your bio */}
            <p className="text-foreground/60 leading-relaxed mb-4">
              I'm a tokenomics consultant specializing in the Internet Computer Protocol (ICP)
              ecosystem and beyond. With a deep understanding of economic incentive design, token
              distribution mechanics, and governance frameworks, I help projects build sustainable
              token economies from the ground up.
            </p>
            <p className="text-foreground/60 leading-relaxed mb-8">
              My approach combines rigorous economic modeling with practical Web3 experience —
              ensuring your token model not only looks good on paper but performs in the real
              market. I've worked with funded projects, SNS DAOs, and early-stage startups across
              multiple chains.
            </p>

            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HIGHLIGHTS.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
                  <span className="text-sm text-foreground/70">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
