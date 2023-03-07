import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import {
  AuthenticationDetails,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

import { Api } from "@/Api";
import { Alert } from "@/components/atoms/Alert";
import { login } from "@/slices/authSlice";
import { useAppDispatch } from "@/store";
import {
  confirmRegistration,
  isCognitoError,
  parseJwt,
  resendConfirmationCode,
  signIn as cognitoSignin,
  translateCognitoError,
} from "@/utils/cognito";
import { useState } from "react";
import { Link, NavigateFunction, useNavigate } from "react-router-dom";

interface State {
  email: string;
  password: string;
  inProgress: boolean;
  errorMessage?: string;
  confirmationCode: string;
  requireConfirmationCode: boolean;
}

export const handleLogin = async (
  session: CognitoUserSession,
  navigate: NavigateFunction,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  const accessToken = session.getAccessToken().getJwtToken();
  const idToken = session.getIdToken().getJwtToken();
  const refreshToken = session.getRefreshToken().getToken();

  Api.setTokens(idToken, accessToken, refreshToken);
  const {
    sub: userId,
    email,
    given_name: firstName,
    family_name: lastName,
  } = parseJwt(idToken);

  dispatch(login({ userId, email, firstName, lastName }));
  navigate(-1);
};

const SigninPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [
    {
      email,
      password,
      inProgress,
      confirmationCode,
      requireConfirmationCode,
      errorMessage,
    },
    setState,
  ] = useState<State>({
    email: "",
    password: "",
    inProgress: false,
    confirmationCode: "",
    requireConfirmationCode: false,
  });

  const updateState = (updates: Partial<State>) => {
    setState((state) => ({ ...state, ...updates }));
  };

  let canSubmit = !!email && !!password;
  if (requireConfirmationCode) {
    canSubmit = canSubmit && !!confirmationCode;
  }

  const signin = async () => {
    updateState({ inProgress: true, errorMessage: undefined });

    const authenticationDetails = new AuthenticationDetails({
      Username: email.trim(),
      Password: password.trim(),
    });

    try {
      if (requireConfirmationCode) {
        await confirmRegistration(email.trim(), confirmationCode.trim());
      }

      const session = await cognitoSignin(authenticationDetails);
      handleLogin(session, navigate, dispatch);
    } catch (err: unknown) {
      if (isCognitoError(err)) {
        updateState({ errorMessage: translateCognitoError(err) });

        switch (err.name) {
          case "UserNotConfirmedException":
            updateState({ requireConfirmationCode: true });
            await resendConfirmationCode(email.trim());
            break;
        }
      }
    } finally {
      updateState({ inProgress: false });
    }
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      <Input
        label="E-postadress"
        value={email}
        onChange={(e) => updateState({ email: e.target.value })}
        tabIndex={1}
        disabled={requireConfirmationCode}
      />
      <Input
        label="Lösenord"
        password
        value={password}
        onChange={(e) => updateState({ password: e.target.value })}
        tabIndex={2}
        disabled={requireConfirmationCode}
      />
      {requireConfirmationCode ? (
        <Input
          label="Verifikationskod"
          value={confirmationCode}
          onChange={(e) => updateState({ confirmationCode: e.target.value })}
          tabIndex={3}
        />
      ) : (
        <Link
          to={`/auth/forgot-password?email=${email}`}
          replace
          className="text-sm text-purple-600 self-start"
        >
          Glömt lösenord?
        </Link>
      )}

      <hr />

      <Alert>{errorMessage}</Alert>
      <Button onClick={signin} disabled={!canSubmit} loading={inProgress} full>
        Logga in
      </Button>
      <Link to="/auth/register" replace>
        <span className="text-sm text-purple-600">Skapa nytt konto</span>
      </Link>
    </div>
  );
};

export default SigninPage;
