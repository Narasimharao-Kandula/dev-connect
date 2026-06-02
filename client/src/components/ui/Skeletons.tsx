function ShimmerLine({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-full shimmer-bg ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[20px] p-6 border border-gray-100 dark:border-gray-800" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
      <ShimmerLine className="h-5 w-2/3 mb-4" />
      <ShimmerLine className="h-3 w-full mb-2" />
      <ShimmerLine className="h-3 w-4/5 mb-2" />
      <ShimmerLine className="h-3 w-3/5" />
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-[20px] p-6 border border-gray-100 dark:border-gray-800" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <ShimmerLine className="h-7 w-1/3" />
            <ShimmerLine className="h-4 w-1/4" />
            <ShimmerLine className="h-4 w-1/5" />
          </div>
          <ShimmerLine className="h-9 w-28 rounded-[12px]" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-[20px] p-6 border border-gray-100 dark:border-gray-800" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <ShimmerLine className="h-5 w-16 mb-4" />
        <ShimmerLine className="h-4 w-full mb-2" />
        <ShimmerLine className="h-4 w-3/4" />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-[20px] p-6 border border-gray-100 dark:border-gray-800" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <ShimmerLine className="h-5 w-12 mb-4" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => <ShimmerLine key={i} className="h-6 w-16 rounded-[8px]" />)}
        </div>
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-[20px] p-6 border border-gray-100 dark:border-gray-800" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <ShimmerLine className="h-5 w-2/3 mb-3" />
          <ShimmerLine className="h-3 w-full mb-2" />
          <ShimmerLine className="h-3 w-4/5 mb-3" />
          <div className="flex gap-1">
            {[1, 2, 3].map((j) => <ShimmerLine key={j} className="h-5 w-14 rounded-[8px]" />)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-900 rounded-[20px] p-6 border border-gray-100 dark:border-gray-800" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <ShimmerLine className="h-6 w-1/3 mb-2" />
        <ShimmerLine className="h-4 w-1/5" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-[20px] p-5 border border-gray-100 dark:border-gray-800" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <ShimmerLine className="h-8 w-12 mb-2 rounded-[10px]" />
            <ShimmerLine className="h-4 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i}>
            <ShimmerLine className="h-5 w-28 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => <div key={j} className="h-20 bg-white dark:bg-gray-900 rounded-[16px] border border-gray-100 dark:border-gray-800 shimmer-bg" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonNotifications() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-[16px] p-4 border border-gray-100 dark:border-gray-800 flex items-start gap-3" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <ShimmerLine className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <ShimmerLine className="h-4 w-3/4" />
            <ShimmerLine className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChats() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-[16px] p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <ShimmerLine className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <ShimmerLine className="h-4 w-1/3" />
            <ShimmerLine className="h-3 w-2/3" />
          </div>
          <ShimmerLine className="h-3 w-10 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDiscover() {
  return (
    <div className="space-y-6">
      <ShimmerLine className="h-10 w-full rounded-[14px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-[20px] p-5 border border-gray-100 dark:border-gray-800" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-3 mb-3">
              <ShimmerLine className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <ShimmerLine className="h-4 w-2/3" />
                <ShimmerLine className="h-3 w-1/3" />
              </div>
            </div>
            <ShimmerLine className="h-3 w-full mb-2" />
            <ShimmerLine className="h-3 w-4/5 mb-3" />
            <div className="flex gap-1">
              {[1, 2, 3].map((j) => <ShimmerLine key={j} className="h-5 w-14 rounded-[8px]" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
