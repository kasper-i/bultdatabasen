import { logout, selectEmail } from "@/slices/authSlice";
import { useAppDispatch } from "@/store";
import { signOut } from "@/utils/cognito";
import { useQueryClient } from "@tanstack/react-query";
import { Fragment, ReactElement, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Api } from "../Api";

function SignoutPage(): ReactElement {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const email = useSelector(selectEmail);
  const queryClient = useQueryClient();

  const logOut = useCallback(async () => {
    Api.clearTokens();

    queryClient.removeQueries({ queryKey: ["roles"], exact: false });

    if (email) {
      await signOut(email);
    }

    dispatch(logout());

    navigate("/");
  }, []);

  useEffect(() => {
    logOut();
  }, [logOut]);

  return <Fragment />;
}

export default SignoutPage;
