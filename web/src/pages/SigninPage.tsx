import axios from "axios";
import { AuthContext } from "contexts/AuthContext";
import React, { Fragment, ReactElement, useEffect } from "react";
import { useContext } from "react";
import { useHistory, useLocation } from "react-router";
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

function SigninPage(): ReactElement {
  const location = useLocation();
  const history = useHistory();
  const { setAuthenticated } = useContext(AuthContext);

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
      .then((response) => {
        const { id_token, access_token, refresh_token }: OAuthTokenResponse =
          response.data;

        Api.setTokens(id_token, access_token, refresh_token);
        Api.saveTokens();
        setAuthenticated(true);

        const returnPath = localStorage.getItem("returnPath");
        localStorage.removeItem("returnPath");

        history.push(returnPath != null ? returnPath : "/");
      })
      .catch(function (error) {});
  }, [location, history]);

  return <Fragment />;
}

export default SigninPage;
