"use client";

import { Component, type ReactNode } from "react";

export class CodeErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-sm text-warning">The code panel failed to render. Streaming state is still held by the session.</div>;
    }
    return this.props.children;
  }
}
