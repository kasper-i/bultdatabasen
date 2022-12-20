import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { AuthenticationDetails } from "amazon-cognito-identity-js";

import { Api } from "@/Api";
import { Alert } from "@/components/atoms/Alert";
import { login } from "@/slices/authSlice";
import { useAppDispatch } from "@/store";
import {
  confirmRegistration,
  parseJwt,
  resendConfirmationCode,
  signin as cognitoSignin,
  translateCognitoError,
} from "@/utils/cognito";
import { isEqual } from "lodash-es";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface State {
  email: string;
  password: string;
  inProgress: boolean;
  errorMessage?: string;
  confirmationCode: string;
  requireConfirmationCode: boolean;
  verficationCodeExpired: boolean;
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
    verficationCodeExpired: false,
  });

  const updateState = (updates: Partial<State>) => {
    setState((state) => ({ ...state, ...updates }));
  };

  let canSubmit = !!state.email && !!state.password;
  if (state.requireConfirmationCode) {
    canSubmit = canSubmit && !!state.confirmationCode;
  }

  const signin = async () => {
    updateState({ inProgress: true, errorMessage: undefined });

    const authenticationDetails = new AuthenticationDetails({
      Username: state.email,
      Password: state.password,
    });

    try {
      if (state.requireConfirmationCode) {
        await confirmRegistration(state.email, state.confirmationCode);
      }

      const result = await cognitoSignin(authenticationDetails);
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

      dispatch(login({ firstName: info.firstName, lastName: info.lastName }));

      navigate(returnPath != null ? returnPath : "/");
    } catch (err: any) {
      updateState({ errorMessage: translateCognitoError(err) });

      switch (err.name) {
        case "UserNotConfirmedException":
          updateState({ requireConfirmationCode: true });
          await resendConfirmationCode(state.email);
          updateState({ verficationCodeExpired: false });
          break;
        case "ExpiredCodeException":
          updateState({ verficationCodeExpired: true });
          break;
      }
    } finally {
      updateState({ inProgress: false });
    }
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      <Input
        label="E-postadress"
        value={state.email}
        onChange={(e) => updateState({ email: e.target.value })}
        tabIndex={1}
        disabled={state.requireConfirmationCode}
      />
      <Input
        label="Lösenord"
        password
        value={state.password}
        onChange={(e) => updateState({ password: e.target.value })}
        tabIndex={2}
        disabled={state.requireConfirmationCode}
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
        onClick={signin}
        disabled={!canSubmit}
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
