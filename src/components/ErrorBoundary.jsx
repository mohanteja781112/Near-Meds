import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-center">
            <div className="inline-flex items-center justify-center p-3 bg-red-500/20 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
            <p className="text-red-200 mb-4">
                The map component crashed. Please try refreshing the page.
            </p>
            <details className="text-left bg-black/50 p-4 rounded text-xs text-red-300 overflow-auto max-h-48 font-mono" open>
                <summary className="cursor-pointer mb-2 font-bold">Error Details</summary>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
