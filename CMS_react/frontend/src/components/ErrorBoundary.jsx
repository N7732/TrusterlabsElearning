import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidMount() {
    sessionStorage.removeItem('chunk_reload_count');
  }

  componentDidCatch(error, errorInfo) {
    // If it's a dynamic import error (chunk loading failed after a new deployment)
    if (
      error.message && 
      (error.message.includes('Failed to fetch dynamically imported module') || 
       error.message.includes('Importing a module script failed'))
    ) {
      const reloadCount = parseInt(sessionStorage.getItem('chunk_reload_count') || '0', 10);
      if (reloadCount < 2) {
        sessionStorage.setItem('chunk_reload_count', (reloadCount + 1).toString());
        window.location.reload();
        return;
      }
    }

    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', margin: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Something went wrong in the UI.</h2>
          <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', backgroundColor: '#f87171', padding: '1rem', borderRadius: '4px', color: '#7f1d1d' }}>
            <strong>Error:</strong> {this.state.error && this.state.error.toString()}
            <br /><br />
            <strong>Component Stack:</strong><br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
