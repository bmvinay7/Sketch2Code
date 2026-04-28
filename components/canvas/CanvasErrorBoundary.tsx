"use client";

import { Component, type ReactNode } from "react";

interface State {
  hasError: boolean;
}

export class CanvasErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid h-full place-items-center bg-background text-center">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Canvas could not render.</h2>
            <p className="mt-2 text-sm text-text-secondary">Refresh the session and your saved backend state remains intact.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
