interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  color?: string;
}

export default function StatCard({ label, value, icon, trend, color = '#6C4CF1' }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[20px] p-5 border border-gray-100/80 dark:border-gray-800/80 transition-all duration-300 card-hover" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
          {trend && <p className="text-xs text-emerald-500 mt-1">{trend}</p>}
        </div>
        <div
          className="w-11 h-11 rounded-[14px] flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${color}12` }}
        >
          <span>{icon}</span>
        </div>
      </div>
    </div>
  );
}
