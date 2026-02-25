import { BarChart3, Coins, Clock, Vote } from 'lucide-react';

const SERVICES = [
  {
    icon: Coins,
    title: 'Tokenomics Design',
    description:
      'End-to-end token model design covering supply mechanics, distribution strategy, utility design, and economic sustainability for your project.',
    accent: 'teal',
  },
  {
    icon: BarChart3,
    title: 'Token Distribution Modeling',
    description:
      'Precise allocation modeling across stakeholder groups — team, investors, community, treasury — with data-driven rationale and benchmarking.',
    accent: 'gold',
  },
  {
    icon: Clock,
    title: 'Vesting & Unlock Planning',
    description:
      'Strategic vesting schedules and cliff periods that protect token price, align long-term incentives, and build investor confidence.',
    accent: 'teal',
  },
  {
    icon: Vote,
    title: 'SNS/DAO Governance Structuring',
    description:
      'ICP-native governance design using the Service Nervous System — neuron staking parameters, voting mechanics, and proposal frameworks.',
    accent: 'gold',
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-medium uppercase tracking-wider mb-4">
            What I Offer
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Consulting Services
          </h2>
          <p className="text-foreground/50 max-w-xl mx-auto">
            Specialized tokenomics expertise to help your project launch with a solid economic
            foundation and sustainable growth model.
          </p>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            const isTeal = service.accent === 'teal';
            return (
              <div
                key={service.title}
                className="card-dark card-dark-hover rounded-xl p-6 flex flex-col gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isTeal ? 'bg-teal/15' : 'bg-gold/15'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${isTeal ? 'text-teal' : 'text-gold'}`}
                  />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="text-sm text-foreground/55 leading-relaxed flex-1">
                  {service.description}
                </p>
                <div
                  className={`h-0.5 w-12 rounded-full ${isTeal ? 'bg-teal' : 'bg-gold'}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
