import { selectAuthenticated } from "@/slices/authSlice";
import { useAppSelector } from "@/store";
import { ReactElement } from "react";
import { Link } from "react-router-dom";
import Button from "./atoms/Button";

function LoginToolbar(): ReactElement {
  const isAuthenticated = useAppSelector(selectAuthenticated);

  if (isAuthenticated) {
    return (
      <Link to="/auth/signout">
        <Button outlined color="white" className="ring-offset-primary-300">
          Logga ut
        </Button>
      </Link>
    );
  } else {
    return (
      <Link to="/auth/signin">
        <Button outlined color="white" className="ring-offset-primary-300">
          Logga in
        </Button>
      </Link>
    );
  }
}

export default LoginToolbar;
