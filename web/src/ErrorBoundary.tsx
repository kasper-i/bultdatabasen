import * as Sentry from "@sentry/react";
import React, { ErrorInfo, ReactNode } from "react";
import Button from "./components/atoms/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  eventId?: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras({ componentStack: errorInfo.componentStack });
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col gap-2.5 justify-center items-center h-screen w-screen">
          <h1 className="font-bold text-3xl">:(</h1>
          <p className="text-center">
            <span className="font-medium">Attans bananer, något gick fel.</span>
            <br />

            {this.state.eventId && (
              <span className="text-gray-500">{this.state.eventId}</span>
            )}
          </p>
          <Button onClick={() => location.reload()}>Ladda om sidan</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
