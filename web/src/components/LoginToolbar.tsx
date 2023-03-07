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
          Logga Ut
        </Button>
      </Link>
    );
  } else {
    return (
      <Link to="/auth/signin" state={{ returnPath: window.location.pathname }}>
        <Button outlined color="white" className="ring-offset-primary-300">
          Logga In
        </Button>
      </Link>
    );
  }
}

export default LoginToolbar;
