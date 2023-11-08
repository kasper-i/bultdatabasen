import { selectAuthenticated } from "@/slices/authSlice";
import { useAppSelector } from "@/store";
import { Button } from "@mantine/core";
import { ReactElement } from "react";
import { Link } from "react-router-dom";

function LoginToolbar(): ReactElement {
  const isAuthenticated = useAppSelector(selectAuthenticated);

  if (isAuthenticated) {
    return (
      <Link to="/auth/signout">
        <Button variant="outline" color="white">
          Logga ut
        </Button>
      </Link>
    );
  } else {
    return (
      <Link to="/auth/signin">
        <Button variant="outline" color="white">
          Logga in
        </Button>
      </Link>
    );
  }
}

export default LoginToolbar;
