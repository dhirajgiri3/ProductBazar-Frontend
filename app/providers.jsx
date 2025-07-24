'use client';

import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';

// Registry and Styles
import StyledComponentsRegistry from '../lib/registry';
import GlobalStyle from '../styles/global';

// Context Providers
import { AuthProvider } from '../lib/contexts/auth-context';
import { ToastProvider } from '../lib/contexts/toast-context';
import { CategoryProvider } from '../lib/contexts/category-context';
import { ProductProvider } from '../lib/contexts/product-context';
import { ProjectProvider } from '../lib/contexts/project-context';
import { RecommendationProvider } from '../lib/contexts/recommendation-context';
import { SocketProvider } from '../lib/contexts/socket-context';
import { ViewProvider } from '../lib/contexts/view-context';
import { WaitlistProvider } from '../lib/contexts/waitlist-context';

// Layout Components
import SmartHeader from '../Components/Header/SmartHeader';
import ErrorBoundary from '../Components/ErrorBoundary';
import ClientOnly from '../Components/ClientOnly';
import ClientCleanup from '../Components/Utility/ClientCleanup';
import LoadingSpinner from '../Components/common/LoadingSpinner';
import Footer from '@/Components/Footer/Footer';
import WaitlistGuard from '@/Components/RouteGuard/WaitlistGuard';


// Minimal header skeleton
const HeaderSkeleton = () => (
  <div className="h-16 bg-transparent">
    <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="flex items-center space-x-4">
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

export function Providers({ children }) {
  return (
    <ErrorBoundary>
      <StyledComponentsRegistry>
        <GlobalStyle />
        <ToastProvider>
          <WaitlistProvider>
            <AuthProvider>
              {/* Global guard to restrict pages when waitlist is enabled */}
              <WaitlistGuard>
                <CategoryProvider>
                  <ProjectProvider>
                    <ProductProvider>
                      <RecommendationProvider>
                        <SocketProvider>
                          <ViewProvider>
                            {/* Smart Header - automatically chooses the right header */}
                            <ClientOnly fallback={<HeaderSkeleton />}>
                              <SmartHeader />
                            </ClientOnly>

                            {/* Main content */}
                            <main>
                              <ErrorBoundary>
                                <Suspense fallback={
                                  <div className="flex items-center justify-center min-h-[200px]">
                                    <LoadingSpinner size="md" color="violet" text="Loading..." />
                                  </div>
                                }>
                                  {children}
                                </Suspense>
                              </ErrorBoundary>
                            </main>

                            {/* Footer - only show if not in waitlist mode */}
                            <ClientOnly fallback={null}>
                              <Footer />
                            </ClientOnly>

                            {/* Toast notifications */}
                            <Toaster
                              position="top-right"
                              toastOptions={{
                                duration: 4000,
                                style: {
                                  background: '#363636',
                                  color: '#fff',
                                },
                                success: {
                                  duration: 3000,
                                  iconTheme: {
                                    primary: '#10b981',
                                    secondary: '#fff',
                                  },
                                },
                                error: {
                                  duration: 5000,
                                  iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#fff',
                                  },
                                },
                              }}
                            />

                            {/* Client-side cleanup */}
                            <ClientCleanup />
                          </ViewProvider>
                        </SocketProvider>
                      </RecommendationProvider>
                    </ProductProvider>
                  </ProjectProvider>
                </CategoryProvider>
              </WaitlistGuard>
            </AuthProvider>
          </WaitlistProvider>
        </ToastProvider>
      </StyledComponentsRegistry>
    </ErrorBoundary>
  );
}
