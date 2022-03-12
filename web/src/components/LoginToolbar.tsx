import { Api } from "@/Api";
import { useAppDispatch, useAppSelector } from "@/store";
import React, { ReactElement } from "react";
import { logout, selectAuthenticated } from "@/slices/authSlice";
import { useQueryClient } from "react-query";
import Button from "./base/Button";

function LoginToolbar(): ReactElement {
  const isAuthenticated = useAppSelector(selectAuthenticated);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const gotoCognito = () => {
    localStorage.setItem("returnPath", window.location.pathname);

    const callback =
      window.location.protocol + "//" + window.location.host + "/signin";

    window.location.href = `https://bultdatabasen.auth.eu-west-1.amazoncognito.com/login?client_id=4bc4eb6q54d9poodouksahhk86&response_type=code&scope=profile+openid&redirect_uri=${callback}`;
  };

  const signOut = () => {
    Api.clearTokens();
    dispatch(logout);
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
