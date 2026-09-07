import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Global React Error Boundary
 * 
 * Catches unhandled JavaScript render exceptions anywhere in the component tree,
 * logs the failure, and renders an accessible fallback UI rather than crashing to a blank screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error to console for diagnosis
    console.error('ErrorBoundary caught an unhandled component exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const errorMessage =
        this.state.error?.message || 'An unexpected rendering error occurred.';

      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
          <div className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl border border-red-200 shadow-xl shadow-red-50 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Application Error
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Something unexpected happened while rendering this page. You can reload the view or return to your dashboard.
              </p>
            </div>

            {/* Error Message Snippet */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-red-300 font-mono text-xs text-left overflow-x-auto shadow-inner">
              <code>{errorMessage}</code>
            </div>

            {/* Recovery Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </button>

              <button
                onClick={this.handleReset}
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
              >
                <Home className="w-4 h-4 mr-2 text-slate-500" />
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
