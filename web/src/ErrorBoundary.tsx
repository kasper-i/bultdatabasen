import React, { ReactNode } from "react";
import Button from "./components/atoms/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col gap-2.5 justify-center items-center h-screen w-screen">
          <h1 className="font-bold text-3xl">:(</h1>
          <h1 className="font-medium">Attans, något gick fel.</h1>
          <Button onClick={() => location.reload()}>Ladda om sidan</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
