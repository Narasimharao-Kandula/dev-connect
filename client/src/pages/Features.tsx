export default function Features() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Everything You Need to Build Together</h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            DevConnect provides all the tools you need to find collaborators, manage projects, and ship products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="🔍"
            title="Developer Discovery"
            description="Find developers by skills, experience, and location. Advanced filters help you find the perfect match for your project."
          />
          <FeatureCard
            icon="🤝"
            title="Smart Collaboration"
            description="Send collaboration requests, build your network, and start working together with a professional workflow."
          />
          <FeatureCard
            icon="💬"
            title="Team Chat"
            description="Real-time messaging with file sharing, code snippets, and group discussions for seamless team communication."
          />
          <FeatureCard
            icon="📊"
            title="Project Management"
            description="Kanban boards, timelines, and task tracking to keep your projects organized and on schedule."
          />
          <FeatureCard
            icon="🏆"
            title="Reputation System"
            description="Build your developer reputation with achievements, endorsements, and a verified skill portfolio."
          />
          <FeatureCard
            icon="🚀"
            title="Startup Matching"
            description="Find co-founders, validate ideas, and build startup teams with our intelligent matching system."
          />
          <FeatureCard
            icon="🎯"
            title="Hackathon Mode"
            description="Quick team formation for hackathons. Find teammates with complementary skills in minutes."
          />
          <FeatureCard
            icon="📈"
            title="Analytics Dashboard"
            description="Track profile views, collaboration success rate, and your growing developer network."
          />
          <FeatureCard
            icon="🛡️"
            title="Skill Verification"
            description="Verify your skills through GitHub integration, certificates, and peer endorsements."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 hover:border-[#6C4CF1]/20 transition" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
