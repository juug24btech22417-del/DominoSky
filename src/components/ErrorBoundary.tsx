import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DominoSky Operational Incident Caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="h-screen w-screen bg-black text-white flex flex-col items-center justify-center p-6 select-none font-mono-numbers"
        >
          <div className="p-6 rounded-2xl bg-[#121620] border border-rose-800 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-700 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h1 className="text-base font-bold text-white tracking-wide">
              OPERATIONS CONSOLE RECOVERY
            </h1>

            <p className="text-xs text-zinc-400">
              A telemetry rendering error occurred. The underlying simulation engine state remains intact.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold text-xs flex items-center justify-center space-x-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Operations Console</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
