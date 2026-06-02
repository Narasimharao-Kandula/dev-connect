import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-gray-900">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-6 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 hover:shadow-xl transition"
            >
              Refresh Page
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
