import configData from "@/config.json";
import { selectAuthenticated } from "@/slices/authSlice";
import { useAppSelector } from "@/store";
import { ReactElement } from "react";
import Button from "./atoms/Button";

function LoginToolbar(): ReactElement {
  const isAuthenticated = useAppSelector(selectAuthenticated);

  const gotoCognitoSignin = () => {
    localStorage.setItem("returnPath", window.location.pathname);

    const callback =
      window.location.protocol + "//" + window.location.host + "/signin";

    window.location.href = `${configData.COGNITO_URL}/login?client_id=${configData.COGNITO_CLIENT_ID}&response_type=code&scope=profile+openid&redirect_uri=${callback}`;
  };

  const gotoCognitoSignout = () => {
    localStorage.setItem("returnPath", window.location.pathname);

    const callback =
      window.location.protocol + "//" + window.location.host + "/signout";

    window.location.href = `${configData.COGNITO_URL}/logout?client_id=${configData.COGNITO_CLIENT_ID}&logout_uri=${callback}`;
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
