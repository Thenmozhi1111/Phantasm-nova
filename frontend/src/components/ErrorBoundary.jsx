import { Component } from 'react';

/**
 * Catches render-time errors anywhere below it in the tree. Without this,
 * an uncaught error during render (e.g. a bad reference in a component)
 * unmounts the entire React root, leaving nothing but the page's black
 * background — no error, no way back except a full reload. This shows a
 * simple recoverable screen instead, with a way to get back to a known-good
 * route without losing the whole tab.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Surface it in dev tools regardless of environment — cheap and
    // never harmful, and it's the only trace left once the tree unmounts.
    console.error('Caught by ErrorBoundary:', error, info);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
          <p className="text-lg font-semibold text-blue-300">Something went wrong loading this page.</p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-md border border-blue-400/60 bg-blue-600/15 px-5 py-2 text-sm font-semibold tracking-wide text-blue-300 hover:bg-blue-500/20 hover:text-white"
          >
            Back to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
