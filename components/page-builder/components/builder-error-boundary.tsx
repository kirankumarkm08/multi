/**
 * Error Boundary for Page Builder
 * Catches errors and provides fallback UI with error details
 */

import React, { ReactNode, ReactElement } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BuilderErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface BuilderErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class BuilderErrorBoundary extends React.Component<
  BuilderErrorBoundaryProps,
  BuilderErrorBoundaryState
> {
  constructor(props: BuilderErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): BuilderErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState((prev) => ({
      ...prev,
      errorInfo,
    }));

    console.error("Builder Error Boundary caught an error:", error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <CardTitle>Page Builder Error</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">Error Details</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-48 text-red-600">
                  {this.state.error?.toString()}
                </pre>
              </div>

              {this.state.errorInfo && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Stack Trace</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-48 text-gray-600 dark:text-gray-300">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3 text-sm">
                <p className="text-blue-900 dark:text-blue-100">
                  If the problem persists, please:
                </p>
                <ul className="list-disc list-inside mt-2 text-blue-800 dark:text-blue-200">
                  <li>Refresh the page</li>
                  <li>Clear your browser cache</li>
                  <li>Contact support if the issue continues</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  className="gap-2"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper component for easier error boundary usage
 */
export function WithBuilderErrorBoundary({
  children,
  onError,
}: {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}): ReactElement {
  return (
    <BuilderErrorBoundary onError={onError}>{children}</BuilderErrorBoundary>
  );
}
