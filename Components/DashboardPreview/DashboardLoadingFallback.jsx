import LoadingSpinner from '../common/LoadingSpinner';

// Loading Fallback
export const DashboardLoadingFallback = () => (
  <div className="py-12 sm:py-16 bg-white">
    <div className="flex justify-center mb-8">
      <div className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-full animate-pulse">
        Dashboard Preview
      </div>
    </div>
    <div className="relative w-full max-w-6xl mx-auto rounded-xl overflow-hidden h-[85vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-white border border-slate-200/70 shadow-2xl shadow-slate-300/40">
      <div className="text-center space-y-4">
        <LoadingSpinner size="md" color="violet" text="Loading dashboard preview..." />
      </div>
    </div>
  </div>
); 