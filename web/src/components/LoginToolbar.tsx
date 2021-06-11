import React, { ReactElement } from "react";
import { Button } from "semantic-ui-react";

function LoginToolbar(): ReactElement {
  const gotoCognito = () => {
    const callback =
      window.location.protocol + "//" + window.location.host + "/signin";
    console.log(callback);

    window.location.href = `https://bultdatabasen.auth.eu-west-1.amazoncognito.com/login?client_id=4bc4eb6q54d9poodouksahhk86&response_type=code&scope=email+openid&redirect_uri=${callback}`;
  };

  return (
    <Button primary size="medium" fluid={false} onClick={gotoCognito}>
      Logga In
    </Button>
  );
}

export default LoginToolbar;
