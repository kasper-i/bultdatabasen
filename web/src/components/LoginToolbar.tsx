import { selectAuthenticated } from "@/slices/authSlice";
import { useAppSelector } from "@/store";
import { ReactElement } from "react";
import { Link } from "react-router-dom";
import Button from "./atoms/Button";
import { Color } from "./atoms/constants";

function LoginToolbar(): ReactElement {
  const isAuthenticated = useAppSelector(selectAuthenticated);

  if (isAuthenticated) {
    return (
      <Link to="/auth/signout">
        <Button outlined color={Color.White}>
          Logga ut
        </Button>
      </Link>
    );
  } else {
    return (
      <Link to="/auth/signin">
        <Button outlined color={Color.White}>
          Logga in
        </Button>
      </Link>
    );
  }
}

export default LoginToolbar;
