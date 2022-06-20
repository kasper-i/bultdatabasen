import { cognitoClientId, cognitoUrl } from "@/constants";
import { selectAuthenticated } from "@/slices/authSlice";
import { useAppSelector } from "@/store";
import React, { ReactElement } from "react";
import Button from "./atoms/Button";

function LoginToolbar(): ReactElement {
  const isAuthenticated = useAppSelector(selectAuthenticated);

  const gotoCognitoSignin = () => {
    localStorage.setItem("returnPath", window.location.pathname);

    const callback =
      window.location.protocol + "//" + window.location.host + "/signin";

    window.location.href = `${cognitoUrl}/login?client_id=${cognitoClientId}&response_type=code&scope=profile+openid&redirect_uri=${callback}`;
  };

  const gotoCognitoSignout = () => {
    localStorage.setItem("returnPath", window.location.pathname);

    const callback =
      window.location.protocol + "//" + window.location.host + "/signout";

    window.location.href = `${cognitoUrl}/logout?client_id=${cognitoClientId}&logout_uri=${callback}`;
  };

  if (isAuthenticated) {
    return (
      <Button
        outlined
        color="white"
        onClick={gotoCognitoSignout}
        className="ring-offset-primary-300"
      >
        Logga Ut
      </Button>
    );
  } else {
    return (
      <Button
        outlined
        color="white"
        onClick={gotoCognitoSignin}
        className="ring-offset-primary-300"
      >
        Logga In
      </Button>
    );
  }
}

export default LoginToolbar;
