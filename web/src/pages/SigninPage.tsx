import axios from "axios";
import { useAppDispatch } from "@/store";
import { isEqual } from "lodash";
import React, { Fragment, ReactElement, useEffect } from "react";
import { login } from "@/slices/authSlice";
import { Api } from "../Api";
import { useNavigate, useSearchParams } from "react-router-dom";

export interface OAuthTokenResponse {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_id: number;
  token_type: string;
}

const instance = axios.create({
  baseURL: "https://bultdatabasen.auth.eu-west-1.amazoncognito.com",
  timeout: 10000,
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
});

const parseJwt = (token: string) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
};

function SigninPage(): ReactElement {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code == null) {
      return;
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", "4bc4eb6q54d9poodouksahhk86");
    params.append("code", code);
    params.append(
      "redirect_uri",
      window.location.protocol + "//" + window.location.host + "/signin"
    );

    instance.post("/oauth2/token", params).then(async (response) => {
      const { id_token, access_token, refresh_token }: OAuthTokenResponse =
        response.data;

      Api.setTokens(id_token, access_token, refresh_token);

      const { given_name, family_name } = parseJwt(id_token);

      const info = await Api.getMyself();
      const updatedInfo = {
        ...info,
        firstName: info.firstName ?? given_name,
        lastName: info.lastName ?? family_name,
      };

      if (!isEqual(info, updatedInfo)) {
        await Api.updateMyself(updatedInfo);
      }

      const returnPath = localStorage.getItem("returnPath");
      localStorage.removeItem("returnPath");

      dispatch(login({ firstName: info.firstName, lastName: info.lastName }));

      navigate(returnPath != null ? returnPath : "/");
    });
  }, [location, navigate, dispatch]);

  return <Fragment />;
}

export default SigninPage;
