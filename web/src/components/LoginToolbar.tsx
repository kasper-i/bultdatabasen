import configData from "@/config.json";
import { selectAuthenticated } from "@/slices/authSlice";
import { useAppSelector } from "@/store";
import { ReactElement } from "react";
import { Link } from "react-router-dom";
import Button from "./atoms/Button";

function LoginToolbar(): ReactElement {
  const isAuthenticated = useAppSelector(selectAuthenticated);

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
      <Link to="/signin">
        <Button outlined color="white" className="ring-offset-primary-300">
          Logga In
        </Button>
      </Link>
    );
  }
}

export default LoginToolbar;
