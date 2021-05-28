import axios from "axios";
import React, { Fragment, ReactElement, useEffect } from "react";
import { useLocation } from "react-router";
import { Api } from "../Api";

interface OAuthTokenResponse {
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

function Signin(): ReactElement {
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get("code");

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

    instance
      .post("/oauth2/token", params)
      .then(function (response) {
        const { id_token, access_token, refresh_token }: OAuthTokenResponse =
          response.data;

        Api.setTokens(id_token, access_token, refresh_token);

        axios.get("https://api.bultdatabasen.se/users/myself", {
          headers: { Authorization: `Bearer ${access_token}` },
        });
      })
      .catch(function (error) {});
  }, [location]);

  return <Fragment />;
}

export default Signin;
