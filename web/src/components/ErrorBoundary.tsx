import React from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { RotateCw, TriangleAlert } from 'lucide-react';
import { Button } from './Button';

/** Shared themed fallback shown by both the class boundary and the router one. */
function ErrorFallback({
  message,
  onRetry,
  retryLabel = 'Try again',
}: {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 16,
        padding: 48,
        minHeight: 320,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)',
        }}
      >
        <TriangleAlert size={22} color="var(--danger)" />
      </div>
      <div style={{ maxWidth: 420 }}>
        <h2 className="h2">Something went wrong</h2>
        <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          {message || 'An unexpected error occurred. You can try again or reload the page.'}
        </p>
      </div>
      {onRetry && (
        <Button variant="primary" leftIcon={<RotateCw size={15} />} onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * Catches render-time errors anywhere in the tree below it and shows a themed
 * fallback instead of a blank screen. Wraps the whole app in main.tsx.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  override render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          message={this.state.error.message}
          onRetry={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}

/**
 * `errorElement` for react-router routes — catches errors thrown while
 * rendering route components or running loaders/actions.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  let message = 'An unexpected error occurred.';
  if (isRouteErrorResponse(error)) message = `${error.status} ${error.statusText}`;
  else if (error instanceof Error) message = error.message;
  return (
    <ErrorFallback
      message={message}
      onRetry={() => window.location.reload()}
      retryLabel="Reload page"
    />
  );
}
