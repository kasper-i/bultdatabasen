import axios from "axios";
import { AuthContext } from "contexts/AuthContext";
import { isEqual } from "lodash";
import React, { Fragment, ReactElement, useContext, useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { Api } from "../Api";

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
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
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
      .then(async (response) => {
        const { id_token, access_token, refresh_token }: OAuthTokenResponse =
          response.data;

        Api.setTokens(id_token, access_token, refresh_token);
        setAuthenticated(true);

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

        history.push(returnPath != null ? returnPath : "/");
      })
      .catch(function (error) {});
  }, [location, history, setAuthenticated]);

  return <Fragment />;
}

export default SigninPage;
