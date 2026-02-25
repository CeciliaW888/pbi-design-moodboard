import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'system-ui', maxWidth: 600, margin: '80px auto' }}>
          <h1 style={{ color: '#e11d48', marginBottom: 16 }}>⚠️ Something went wrong</h1>
          <p style={{ marginBottom: 12, color: '#666' }}>The app crashed. Here's the error:</p>
          <pre style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
            padding: 16, overflow: 'auto', fontSize: 13, color: '#991b1b', marginBottom: 16
          }}>
            {this.state.error?.toString()}
            {this.state.errorInfo?.componentStack}
          </pre>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              style={{ padding: '8px 20px', background: '#0078d4', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
            >
              Try Again
            </button>
            <button
              onClick={() => { localStorage.removeItem('pbi-moodboard-state'); window.location.reload(); }}
              style={{ padding: '8px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
            >
              Clear Data & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
