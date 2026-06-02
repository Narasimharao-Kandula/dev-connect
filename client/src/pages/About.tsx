import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] transition-colors text-sm">&larr; Back to Home</Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 text-center">About DevConnect</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
          We're on a mission to make developer collaboration as seamless as writing code.
        </p>

        <div className="mt-16 space-y-12">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Our Mission</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              Every developer has faced the challenge of finding the right people to build with.
              Whether you're a student looking for a hackathon team, a freelancer needing specialists,
              or a founder searching for a technical co-founder — the process is broken.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              DevConnect solves this by creating a platform where skill-based matching meets
              real collaboration. We don't just help you find developers — we help you build
              teams, manage projects, and ship products together.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">The Problem We Solve</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { problem: 'Students can\'t find project teammates', solution: 'Discover peers with complementary skills' },
                { problem: 'Hackathon teams form randomly', solution: 'Find teammates who match your stack' },
                { problem: 'Freelancers need specialists', solution: 'Verified skill profiles and endorsements' },
                { problem: 'Founders can\'t find co-founders', solution: 'Startup matching and idea validation' },
              ].map((item) => (
                <div key={item.problem} className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                  <div className="text-sm text-gray-400 dark:text-gray-500">Problem</div>
                  <div className="text-gray-900 dark:text-gray-100 font-medium">{item.problem}</div>
                  <div className="text-sm text-[#6C4CF1] mt-2">→ {item.solution}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Our Story</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              DevConnect started as a college project that solved a real problem — the difficulty
              of finding developers to collaborate with. What began as a simple matching tool
              grew into a full collaboration platform with project management, team workspaces,
              and a thriving developer community.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
