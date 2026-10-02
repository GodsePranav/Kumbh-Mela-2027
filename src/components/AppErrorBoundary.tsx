import React from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
  retrying: boolean;
}

export default class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false, retrying: false };

  static getDerivedStateFromError(): Partial<AppErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application render failed:', error, info.componentStack);
  }

  private retry = () => {
    this.setState({ retrying: true }, () => window.location.reload());
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-[#FEFAF4] flex items-center justify-center p-6">
        <section
          aria-labelledby="app-error-title"
          aria-describedby="app-error-description"
          className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-lg"
          role="alert"
        >
          <div aria-hidden="true" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-2xl">
            ⚠️
          </div>
          <h1 id="app-error-title" className="text-lg font-bold text-stone-900">This screen could not be loaded</h1>
          <p id="app-error-description" className="mt-2 text-sm text-stone-600">
            Your saved information is still intact. Try loading the app again.
          </p>
          <button
            type="button"
            onClick={this.retry}
            disabled={this.state.retrying}
            className="mt-5 w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60"
          >
            {this.state.retrying ? 'Reloading…' : 'Try again'}
          </button>
        </section>
      </main>
    );
  }
}
