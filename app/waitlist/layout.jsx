import { Suspense } from 'react';
import LoadingSpinner from '../../Components/common/LoadingSpinner';

export const metadata = {
  title: 'Join the Ecosystem | Product Bazar',
  description: 'Join the definitive ecosystem where products grow beyond launch day. Connect with founders, investors, and collaborators who build for impact.',
  robots: {
    index: false, // Don't index waitlist pages
    follow: false,
  },
};

// Enhanced loading component with better UX
function LoadingComponent() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <LoadingSpinner size="lg" color="violet" text="Loading Waitlist Experience" />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-white">
            Loading Waitlist Experience
          </h2>
          <p className="text-slate-400 text-sm max-w-md">
            We're preparing your personalized waitlist experience...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WaitlistLayout({ children }) {
  return (
    <Suspense fallback={<LoadingComponent />}>
      {children}
    </Suspense>
  );
} 