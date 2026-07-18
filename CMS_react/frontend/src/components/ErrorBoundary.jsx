import React from 'react';
import GlobalLoader from './common/GlobalLoader';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    const isChunkError = error.message && (
      error.message.includes('Failed to fetch dynamically imported module') || 
      error.message.includes('Importing a module script failed')
    );
    return { hasError: true, isChunkError };
  }

  componentDidMount() {
    sessionStorage.removeItem('chunk_reload_count');
  }

  componentDidCatch(error, errorInfo) {
    if (this.state.isChunkError) {
      const reloadCount = parseInt(sessionStorage.getItem('chunk_reload_count') || '0', 10);
      if (reloadCount < 2) {
        sessionStorage.setItem('chunk_reload_count', (reloadCount + 1).toString());
        window.location.reload();
        return;
      }
    }

    this.setState({
      error: error,
      errorInfo: errorInfo,
      isChunkError: false // If we exceeded reload count, show the actual error
    });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isChunkError) {
        // Show a full-screen loader instead of the red error box while the page reloads
        return <GlobalLoader />;
      }
      
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
