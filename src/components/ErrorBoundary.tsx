import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="m-8 rounded-lg bg-red-50 p-6 text-red-800">
        <p className="font-bold">Algo deu errado ao exibir esta tela.</p>
        <p className="mt-1 text-sm">{this.state.error.message}</p>
        <button
          type="button"
          className="mt-4 rounded bg-red-700 px-3 py-2 text-white"
          onClick={() => window.location.assign("/")}
        >
          Voltar ao início
        </button>
      </div>
    );
  }
}
