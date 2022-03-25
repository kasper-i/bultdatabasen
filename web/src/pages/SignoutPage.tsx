import { logout } from "@/slices/authSlice";
import { useAppDispatch } from "@/store";
import React, { Fragment, ReactElement, useEffect } from "react";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { Api } from "../Api";

function SignoutPage(): ReactElement {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    Api.clearTokens();
    queryClient.removeQueries(["role"]);

    const returnPath = localStorage.getItem("returnPath");
    localStorage.removeItem("returnPath");

    dispatch(logout());

    navigate(returnPath != null ? returnPath : "/");
  }, [dispatch]);

  return <Fragment />;
}

export default SignoutPage;
