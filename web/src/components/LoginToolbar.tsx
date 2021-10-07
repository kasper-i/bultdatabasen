import { Api } from "Api";
import { AuthContext } from "contexts/AuthContext";
import { queryClient } from "index";
import React, { ReactElement, useContext } from "react";
import { Button } from "semantic-ui-react";

function LoginToolbar(): ReactElement {
  const { isAuthenticated, setAuthenticated } = useContext(AuthContext);

  const gotoCognito = () => {
    localStorage.setItem("returnPath", window.location.pathname);

    const callback =
      window.location.protocol + "//" + window.location.host + "/signin";

    window.location.href = `https://bultdatabasen.auth.eu-west-1.amazoncognito.com/login?client_id=4bc4eb6q54d9poodouksahhk86&response_type=code&scope=profile+openid&redirect_uri=${callback}`;
  };

  const signOut = () => {
    Api.clearTokens();
    setAuthenticated(false);
    queryClient.removeQueries(["role"]);
  };

  if (isAuthenticated) {
    return (
      <Button
        compact
        primary
        size="medium"
        fluid={false}
        onClick={() => signOut()}
      >
        Logga Ut
      </Button>
    );
  }

  return (
    <Button compact primary size="medium" fluid={false} onClick={gotoCognito}>
      Logga In
    </Button>
  );
}

export default LoginToolbar;
