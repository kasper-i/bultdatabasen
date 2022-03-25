import { cognitoClientId, cognitoUrl } from "@/constants";
import { selectAuthenticated } from "@/slices/authSlice";
import { useAppSelector } from "@/store";
import React, { ReactElement } from "react";
import Button from "./base/Button";

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
      <Button onClick={gotoCognitoSignout} className="ring-offset-gray-900">
        Logga Ut
      </Button>
    );
  } else {
    return (
      <Button onClick={gotoCognitoSignin} className="ring-offset-gray-900">
        Logga In
      </Button>
    );
  }
}

export default LoginToolbar;
