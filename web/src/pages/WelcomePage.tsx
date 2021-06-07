import React, { ReactElement } from "react";
import { Button } from "semantic-ui-react";

function WelcomePage(): ReactElement {
  const gotoCognito = () => {
    const callback =
      window.location.protocol + "//" + window.location.host + "/signin";
    console.log(callback);

    window.location.href = `https://bultdatabasen.auth.eu-west-1.amazoncognito.com/login?client_id=4bc4eb6q54d9poodouksahhk86&response_type=code&scope=email+openid&redirect_uri=${callback}`;
  };

  return (
    <>
      <div className="absolute top-0 right-0 flex justify-end p-5">
        <Button primary size="medium" fluid={false} onClick={gotoCognito}>
          Logga In
        </Button>
      </div>
      <div className="flex flex-grow flex-col items-center justify-center text-white">
        <h1 className="text-5xl">Bultdatabasen</h1>
        <p className="italic text-lg">
          En databas över borrbultar, limbultar, ankare, etc.
        </p>
      </div>
    </>
  );
}

export default WelcomePage;
