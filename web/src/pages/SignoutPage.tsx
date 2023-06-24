import { logout } from "@/slices/authSlice";
import { useAppDispatch } from "@/store";
import { signOut } from "@/utils/cognito";
import { useQueryClient } from "@tanstack/react-query";
import { Fragment, ReactElement, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Api } from "../Api";

function SignoutPage(): ReactElement {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logOut = useCallback(async () => {
    Api.clearAccessToken();

    queryClient.removeQueries({ queryKey: ["roles"], exact: false });

    await signOut();

    dispatch(logout());

    navigate("/");
  }, []);

  useEffect(() => {
    logOut();
  }, [logOut]);

  return <Fragment />;
}

export default SignoutPage;
