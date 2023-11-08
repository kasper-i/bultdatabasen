import { Button, Center, Stack, Text } from "@mantine/core";
import { captureException, withScope } from "@sentry/core";
import React, { ErrorInfo, ReactNode } from "react";
import classes from "./ErrorBoundary.module.css";

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
        <Center className={classes.container}>
          <Stack>
            <Text className={classes.smiley}>:(</Text>
            <Text ta="center">
              Attans bananer, något gick fel.
              <br />
              {this.state.eventId && <Text fw={500}>{this.state.eventId}</Text>}
            </Text>
            <Button variant="filled" onClick={() => location.reload()}>
              Ladda om sidan
            </Button>
          </Stack>
        </Center>
      );
    }

    return this.props.children;
  }
}
