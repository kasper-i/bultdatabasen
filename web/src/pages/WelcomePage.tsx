import React, { ReactElement } from "react";
import { Button } from "semantic-ui-react";

function WelcomePage(): ReactElement {
  return (
    <div className="flex flex-grow flex-col items-center justify-center space-y-2.5">
      <h1 className="text-5xl">Bultdatabasen</h1>
      <p className="italic text-lg">
        En databas över borrbultar, limbultar, ankare, etc.
      </p>
    </div>
  );
}

export default WelcomePage;
