import { Button } from "@mantine/core";
import { captureException, withScope } from "@sentry/core";
import React, { ErrorInfo, ReactNode } from "react";

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
    withScope((scope) => {
      scope.setExtras({ componentStack: errorInfo.componentStack });
      const eventId = captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-tailwind="flex flex-col gap-2.5 justify-center items-center h-screen w-screen">
          <h1 data-tailwind="font-bold text-3xl">:(</h1>
          <p data-tailwind="text-center">
            <span data-tailwind="font-medium">
              Attans bananer, något gick fel.
            </span>
            <br />

            {this.state.eventId && (
              <span data-tailwind="text-gray-500">{this.state.eventId}</span>
            )}
          </p>
          <Button variant="filled" onClick={() => location.reload()}>
            Ladda om sidan
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
