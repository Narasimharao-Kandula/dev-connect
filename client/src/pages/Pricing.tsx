import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Simple, Transparent Pricing</h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Start for free. Upgrade as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            name="Free"
            price="$0"
            description="Perfect for getting started"
            features={[
              'Basic developer profile',
              'Up to 3 projects',
              'Public chat',
              'Community access',
              'Developer discovery',
            ]}
            cta="Get Started"
            ctaLink="/register"
            featured={false}
          />
          <PricingCard
            name="Pro"
            price="$12"
            period="/month"
            description="For serious developers"
            features={[
              'Advanced analytics',
              'Unlimited projects',
              'File sharing & attachments',
              'Team workspace',
              'Skill verification',
              'Priority support',
              'Custom profile URL',
            ]}
            cta="Start Free Trial"
            ctaLink="/register"
            featured={true}
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            description="For teams and organizations"
            features={[
              'Everything in Pro',
              'Unlimited team members',
              'Custom integrations',
              'Dedicated account manager',
              'SSO & audit logs',
              'SLA guarantee',
              'On-premise option',
            ]}
            cta="Contact Sales"
            ctaLink="/contact"
            featured={false}
          />
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  name, price, period, description, features, cta, ctaLink, featured,
}: {
  name: string; price: string; period?: string; description: string;
  features: string[]; cta: string; ctaLink: string; featured: boolean;
}) {
  return (
    <div className={`rounded-[20px] p-8 ${featured ? 'bg-[#6C4CF1]/5 border-2 border-[#6C4CF1] scale-105' : 'bg-white dark:bg-gray-900 border border-gray-100/80 dark:border-gray-800/80'}`} style={featured ? { boxShadow: '0 4px 24px rgba(0,0,0,0.04)' } : { boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
      {featured && <span className="text-xs font-medium text-[#6C4CF1] border border-[#6C4CF1]/20 rounded-[8px] px-3 py-1">Most Popular</span>}
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-4">{name}</h3>
      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{price}</span>
        {period && <span className="text-gray-400 dark:text-gray-500 ml-1">{period}</span>}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <svg className="w-4 h-4 text-[#6C4CF1] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <Link
        to={ctaLink}
        className={`mt-8 block text-center py-3 rounded-[12px] font-semibold transition ${
          featured
            ? 'bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white shadow-lg shadow-[#6C4CF1]/20'
            : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
