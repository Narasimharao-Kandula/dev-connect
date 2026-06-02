import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const STEPS = ['Bio', 'Experience', 'Location', 'Links', 'Preferences', 'Skills'];

export default function OnboardingWizard() {
  const { completeOnboarding, loading, error } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    bio: '', experience: 0, country: '', timezone: '',
    githubUrl: '', portfolio: '', remoteOnly: false, openToCollab: true,
    availability: 'Available', skillsInput: '',
  });

  const update = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) { setStep((s) => s + 1); return; }
    const skills = form.skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
    try {
      await completeOnboarding({ ...form, skills });
      navigate('/dashboard');
    } catch {}
  };

  const showInput = (label: string, field: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={(form as any)[field] ?? ''}
        onChange={(e) => update(field, type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-full bg-gray-50/50 border-2 border-gray-200 rounded-[14px] px-3 py-2 text-gray-900 focus:outline-none focus:border-[#6C4CF1] placeholder:text-gray-400"
        placeholder={placeholder}
        required={field !== 'githubUrl' && field !== 'portfolio'}
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8f9fc] dark:bg-[#0f0f1a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#6C4CF1]">DevConnect</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Complete your profile</p>
        </div>
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-2 w-10 rounded-full ${i <= step ? 'bg-[#6C4CF1]' : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>
        <div className="text-center text-sm text-gray-400 dark:text-gray-500 mb-4">{STEPS[step]} ({step + 1}/{STEPS.length})</div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-8 space-y-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-4 py-2 rounded-[12px] text-sm">{error}</div>}
          {step === 0 && (
            <div>
              <label className="block text-sm text-gray-500 mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
                className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] h-24 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Tell us about yourself..."
                required
              />
            </div>
          )}
          {step === 1 && showInput('Years of Experience', 'experience', 'number', 'e.g. 5')}
          {step === 2 && showInput('Country', 'country', 'text', 'e.g. India')}
          {step === 3 && (
            <>
              {showInput('GitHub URL', 'githubUrl', 'url', 'https://github.com/yourusername')}
              {showInput('Portfolio URL', 'portfolio', 'url', 'https://yourportfolio.dev')}
            </>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Availability</label>
                <select
                  value={form.availability}
                  onChange={(e) => update('availability', e.target.value)}
                  className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="LookingForTeam">Looking for Team</option>
                </select>
              </div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.remoteOnly}
                  onChange={(e) => update('remoteOnly', e.target.checked)}
                  className="w-4 h-4 rounded text-[#6C4CF1]"
                />
                <span className="text-gray-700 dark:text-gray-200 text-sm">Remote only</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.openToCollab}
                  onChange={(e) => update('openToCollab', e.target.checked)}
                  className="w-4 h-4 rounded text-[#6C4CF1]"
                />
                <span className="text-gray-700 dark:text-gray-200 text-sm">Open to collaboration</span>
              </label>
            </div>
          )}
          {step === 5 && (
            <div>
              <label className="block text-sm text-gray-500 mb-1">Skills (separate each with a comma)</label>
              <input
                type="text"
                value={form.skillsInput}
                onChange={(e) => update('skillsInput', e.target.value)}
        className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="React, Node.js, TypeScript"
                required
              />
              {form.skillsInput && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.skillsInput.split(',').map((s, i) => (
                    <span key={i} className="bg-[#6C4CF1]/10 text-[#6C4CF1] border border-[#6C4CF1]/20 text-xs px-2 py-1 rounded-[8px]">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white font-semibold py-2.5 rounded-[12px] shadow-lg shadow-[#6C4CF1]/20 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : step < STEPS.length - 1 ? 'Next' : 'Complete Setup'}
          </button>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="w-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm py-1"
            >
              Back
            </button>
          )}
        </form>
      </div>
    </main>
  );
}
