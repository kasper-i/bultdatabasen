import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import configData from "@/config.json";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

import { login } from "@/slices/authSlice";
import { Alert } from "@/components/atoms/Alert";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Api } from "@/Api";
import { useAppDispatch } from "@/store";
import { isEqual } from "lodash-es";

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

export const useCognitoUserPool = () => {
  return useMemo(() => {
    return new CognitoUserPool({
      UserPoolId: configData.COGNITO_POOL_ID,
      ClientId: configData.COGNITO_CLIENT_ID,
    });
  }, []);
};

export const useCognitoUser = (username: string) => {
  const userPool = useCognitoUserPool();

  return useMemo(() => {
    const userData = {
      Username: username,
      Pool: userPool,
    };

    return new CognitoUser(userData);
  }, [username]);
};

const getErrorMessage = (cognitoException: string) => {
  switch (cognitoException) {
    case "NotAuthorizedException":
      return "Fel e-postadress eller lösenord";
    case "CodeMismatchException":
      return "Fel verfikationskod";
    default:
      return cognitoException;
  }
};

interface State {
  email: string;
  password: string;
  inProgress: boolean;
  errorMessage?: string;
  confirmationCode: string;
  requireConfirmationCode: boolean;
  verficationCodeSent: boolean;
}

const SigninPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [state, setState] = useState<State>({
    email: "",
    password: "",
    inProgress: false,
    confirmationCode: "",
    requireConfirmationCode: false,
    verficationCodeSent: false,
  });

  const updateState = (updates: Partial<State>) => {
    setState((state) => ({ ...state, ...updates }));
  };

  const cognitoUser = useCognitoUser(state.email);

  const signin = async () => {
    updateState({ inProgress: true, errorMessage: undefined });

    try {
      const authenticationDetails = new AuthenticationDetails({
        Username: state.email,
        Password: state.password,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async function (result) {
          const accessToken = result.getAccessToken().getJwtToken();
          const idToken = result.getIdToken().getJwtToken();
          const refreshToken = result.getRefreshToken().getToken();

          Api.setTokens(idToken, accessToken, refreshToken);

          const { given_name, family_name } = parseJwt(idToken);

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

          dispatch(
            login({ firstName: info.firstName, lastName: info.lastName })
          );

          navigate(returnPath != null ? returnPath : "/");

          updateState({ inProgress: false });
        },

        onFailure: function (err) {
          if (err.name === "UserNotConfirmedException") {
            updateState({ requireConfirmationCode: true });
            updateState({ inProgress: false });
            resendConfirmationCode();
          } else {
            updateState({ errorMessage: getErrorMessage(err.name) });
            updateState({ inProgress: false });
          }
        },
      });
    } catch {
      updateState({ inProgress: false });
    }
  };

  const resendConfirmationCode = () => {
    cognitoUser.resendConfirmationCode(function (err) {
      if (!err) {
        updateState({ verficationCodeSent: true });
      }
    });
  };

  const confirmRegistration = () => {
    cognitoUser.confirmRegistration(
      state.confirmationCode,
      true,
      function (err) {
        if (err) {
          updateState({ errorMessage: getErrorMessage(err.name) });
          return;
        }

        signin();
      }
    );
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      <Input
        label="E-postadress"
        value={state.email}
        onChange={(e) => updateState({ email: e.target.value })}
        tabIndex={1}
      />
      <Input
        label="Lösenord"
        password
        value={state.password}
        onChange={(e) => updateState({ password: e.target.value })}
        tabIndex={2}
      />
      {state.requireConfirmationCode ? (
        <Input
          label="Verifikationskod"
          value={state.confirmationCode}
          onChange={(e) => updateState({ confirmationCode: e.target.value })}
          tabIndex={3}
        />
      ) : (
        <Link
          to="/auth/forgot-password"
          className="text-sm text-purple-600 self-start"
        >
          Återställ lösenord
        </Link>
      )}

      <hr />

      <Alert>{state.errorMessage}</Alert>
      <Button
        onClick={state.requireConfirmationCode ? confirmRegistration : signin}
        disabled={!state.email || !state.password}
        loading={state.inProgress}
        full
      >
        Logga in
      </Button>
      <Link to="/auth/register">
        <span className="text-sm text-purple-600">Skapa nytt konto</span>
      </Link>
    </div>
  );
};

export default SigninPage;
