import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../api/client';
import FileUpload from '../components/ui/FileUpload';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateProject() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const addSkill = () => {
    const s = skillInput.trim().toLowerCase();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput('');
  };

  const onSubmit = async (data: FormData) => {
    if (skills.length === 0) { toast.error('Please add at least one skill before creating your project.'); return; }
    try {
      const res = await api.post('/projects', { ...data, description: data.description || undefined, skills });
      toast.success('Your project has been created successfully!');
      navigate(`/projects/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "We couldn't create your project. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/projects" className="text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] transition-colors text-sm">&larr; Back</Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Project</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 space-y-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Project Name</label>
          <input type="text" {...register('name')}
            className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 rounded-[14px] px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] transition-colors ${
              errors.name ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
            }`}
            placeholder="Enter project name" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Description</label>
          <textarea {...register('description')} rows={4}
            className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 rounded-[14px] px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] transition-colors resize-none ${
              errors.description ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
            }`}
            placeholder="Describe your project..." />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Skills Needed</label>
          <div className="flex gap-2">
            <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Type skill and press Enter"
              className="flex-1 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#6C4CF1] placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors" />
            <button type="button" onClick={addSkill} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-[12px] text-sm font-semibold cursor-pointer transition-colors">Add</button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 bg-[#6C4CF1]/5 text-[#6C4CF1] px-3 py-1.5 rounded-[8px] text-sm font-medium">
                  {s}
                  <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="text-[#6C4CF1]/60 hover:text-red-500 cursor-pointer" aria-label={"Remove " + s}>&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Attachments</label>
          <FileUpload files={files} onFilesChange={setFiles} accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif'], 'application/pdf': ['.pdf'] }} maxSize={10 * 1024 * 1024} multiple />
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white font-semibold py-3 rounded-[14px] text-sm shadow-lg shadow-[#6C4CF1]/20 hover:shadow-xl hover:shadow-[#6C4CF1]/30 transition-all duration-200 disabled:opacity-60 cursor-pointer">
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
}
