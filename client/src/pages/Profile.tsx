import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api, { uploadAvatar } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { LoadingPage } from '../components/ui/LottieLoader';
import LottieLoader from '../components/ui/LottieLoader';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  country: z.string().max(100).optional().or(z.literal('')),
  timezone: z.string().max(100).optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional().or(z.literal('')),
  experience: z.number().min(0, 'Experience cannot be negative').max(100),
  githubUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  portfolio: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  remoteOnly: z.boolean(),
  openToCollab: z.boolean(),
  availability: z.string().min(1),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const isOwnProfile = !id;

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/auth/me');
        reset({
          name: data.name || '',
          country: data.country || '',
          timezone: data.timezone || '',
          bio: data.profile?.bio || '',
          experience: data.profile?.experience || 0,
          githubUrl: data.profile?.githubUrl || '',
          portfolio: data.profile?.portfolio || '',
          remoteOnly: data.profile?.remoteOnly || false,
          openToCollab: data.profile?.openToCollab ?? true,
          availability: data.availability,
        });
        setAvatarUrl(data.avatar || '');
        setSkills(data.skills?.map((s: any) => s.skill.name) || []);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [id, reset]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const { avatar } = await uploadAvatar(file);
      setAvatarUrl(avatar);
    } catch {}
    setAvatarUploading(false);
  };

  const onSubmit = async (data: ProfileForm) => {
    try {
      await api.patch('/users/profile', data);
      await api.patch('/users/skills', { skills });
      await api.patch('/users/availability', { availability: data.availability });
      navigate('/dashboard');
    } catch {}
  };

  const addSkill = () => {
    const s = skillInput.trim().toLowerCase();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput('');
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] transition-colors text-sm shrink-0">&larr; Back</Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{isOwnProfile ? 'Edit Profile' : 'Profile'}</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl text-gray-400 dark:text-gray-500">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <LottieLoader />
                </div>
              )}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={avatarUploading}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded-[12px] text-sm font-semibold disabled:opacity-50">
                {avatarUploading ? 'Uploading avatar...' : 'Change Avatar'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Name</label>
              <input type="text" {...register('name')}
                className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]" />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Country</label>
              <input type="text" {...register('country')}
                className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Timezone</label>
              <input type="text" {...register('timezone')}
                className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Availability</label>
              <select {...register('availability')}
                className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]">
                <option>Available</option>
                <option>Busy</option>
                <option>LookingForTeam</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Professional</h2>
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Bio</label>
            <textarea {...register('bio')} rows={3}
              className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]" />
            {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Experience (years)</label>
              <input type="number" {...register('experience', { valueAsNumber: true })}
                className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]" />
              {errors.experience && <p className="text-sm text-red-500">{errors.experience.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">GitHub URL</label>
              <input type="url" {...register('githubUrl')}
                className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]" />
              {errors.githubUrl && <p className="text-sm text-red-500">{errors.githubUrl.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Portfolio URL</label>
              <input type="url" {...register('portfolio')}
                className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1]" />
              {errors.portfolio && <p className="text-sm text-red-500">{errors.portfolio.message}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <input type="checkbox" {...register('remoteOnly')} className="rounded text-[#6C4CF1]" />
              Remote Only
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <input type="checkbox" {...register('openToCollab')} className="rounded text-[#6C4CF1]" />
              Open to Collaboration
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Skills</h2>
          <div className="flex gap-2">
            <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Type a skill and press Enter"
              className="flex-1 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] placeholder:text-gray-400 dark:placeholder:text-gray-500" />
            <button type="button" onClick={addSkill} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-[12px] text-sm font-semibold">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-[8px] text-sm flex items-center gap-2">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="text-gray-400 dark:text-gray-500 hover:text-red-500" aria-label={"Remove " + s + " skill"}>&times;</button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white font-semibold py-2.5 rounded-[12px] shadow-lg shadow-[#6C4CF1]/20 transition disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
