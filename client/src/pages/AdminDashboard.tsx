import { useEffect, useState } from 'react';
import api from '../api/client';
import { LoadingPage } from '../components/ui/LottieLoader';
import { formatDate } from '../utils/helpers';
import DataTable from '../components/ui/DataTable';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  country: string | null;
  _count?: { ownedProjects: number; reviewsReceived: number };
  createdAt: string;
}

const userColumns: ColumnDef<UserRow>[] = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableSorting: true },
  {
    accessorKey: 'role',
    header: 'Role',
    enableSorting: true,
    cell: ({ getValue }) => {
      const role = getValue() as string;
      return (
        <span className={`text-xs px-2 py-0.5 rounded-[8px] font-medium ${
          role === 'Admin'
            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
        }`}>
          {role}
        </span>
      );
    },
  },
  { accessorKey: 'country', header: 'Country', enableSorting: true, cell: ({ getValue }) => (getValue() as string) || '-' },
  { accessorKey: '_count.ownedProjects', header: 'Projects', enableSorting: true, cell: ({ row }) => row.original._count?.ownedProjects ?? 0 },
  { accessorKey: '_count.reviewsReceived', header: 'Reviews', enableSorting: true, cell: ({ row }) => row.original._count?.reviewsReceived ?? 0 },
  { accessorKey: 'createdAt', header: 'Joined', enableSorting: true, cell: ({ getValue }) => formatDate(getValue() as string) },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const isAdmin = row.original.role === 'Admin';
      return (
        <button
          onClick={async () => {
            try {
              await api.patch(`/admin/users/${row.original.id}/role`, { role: isAdmin ? 'User' : 'Admin' });
              toast.success(`User ${isAdmin ? 'demoted' : 'promoted'} successfully`);
              window.location.reload();
            } catch { toast.error('Failed to update role'); }
          }}
          className={`text-xs font-medium cursor-pointer ${isAdmin ? 'text-amber-500 hover:text-amber-600' : 'text-[#6C4CF1] hover:text-[#5538D6]'}`}
        >
          {isAdmin ? 'Demote' : 'Promote'}
        </button>
      );
    },
  },
];

const chartData = [
  { month: 'Jan', users: 400, projects: 240 },
  { month: 'Feb', users: 600, projects: 320 },
  { month: 'Mar', users: 800, projects: 410 },
  { month: 'Apr', users: 1200, projects: 580 },
  { month: 'May', users: 1800, projects: 720 },
  { month: 'Jun', users: 2400, projects: 890 },
  { month: 'Jul', users: 3100, projects: 1050 },
  { month: 'Aug', users: 3800, projects: 1240 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
    ]).then(([statsRes, usersRes]) => {
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats && [
          { label: 'Users', value: stats.totalUsers, color: 'text-[#6C4CF1]' },
          { label: 'Projects', value: stats.totalProjects, color: 'text-blue-500' },
          { label: 'Teams', value: stats.totalTeams, color: 'text-emerald-500' },
          { label: 'Reviews', value: stats.totalReviews, color: 'text-amber-500' },
          { label: 'Tasks', value: stats.totalTasks, color: 'text-purple-500' },
        ].map((s) => (
          <div key={s.label} className="inline-flex flex-col bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Growth</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C4CF1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6C4CF1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9595ad' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9595ad' }} />
              <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid #e8e8ef', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }} />
              <Area type="monotone" dataKey="users" stroke="#6C4CF1" strokeWidth={2} fill="url(#userGradient)" />
              <Area type="monotone" dataKey="projects" stroke="#10B981" strokeWidth={2} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-6 pb-4">Users</h2>
        <DataTable columns={userColumns} data={users} />
      </div>
    </div>
  );
}
