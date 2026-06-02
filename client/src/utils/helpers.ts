export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(date: string) {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getAvailabilityColor(status: string) {
  switch (status) {
    case 'Available': return 'text-emerald-500';
    case 'Busy': return 'text-red-500';
    case 'LookingForTeam': return 'text-amber-500';
    default: return 'text-gray-400';
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'Planning': return 'bg-amber-50 text-amber-600 border border-amber-200';
    case 'InProgress': return 'bg-blue-50 text-blue-600 border border-blue-200';
    case 'Completed': return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
    case 'Archived': return 'bg-gray-100 text-gray-500 border border-gray-200';
    default: return 'bg-gray-100 text-gray-500 border border-gray-200';
  }
}
