import React, { Component } from "react";

export class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
    };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, background: 'red', color: 'white', zIndex: 9999, position: 'fixed', top: 0, left: 0 }}>
                    <h1>Something went wrong.</h1>
                    <pre>{this.state.error?.message}</pre>
                    <pre>{this.state.error?.stack}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}
