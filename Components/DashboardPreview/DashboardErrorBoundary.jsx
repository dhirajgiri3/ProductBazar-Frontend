import React from 'react';
import { LayoutDashboard } from 'lucide-react';

// Error Boundary
export class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DashboardPreview Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-12 sm:py-16 bg-white">
          <div className="flex justify-center mb-8">
            <div className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">
              Dashboard Preview
            </div>
          </div>
          <div className="relative w-full max-w-6xl mx-auto rounded-xl overflow-hidden h-[85vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-white border border-slate-200/70 shadow-2xl shadow-slate-300/40">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
                <LayoutDashboard size={24} className="text-violet-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Dashboard Preview</h3>
                <p className="text-sm text-slate-600 max-w-md">
                  Experience our intuitive dashboard interface with real-time analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
} 