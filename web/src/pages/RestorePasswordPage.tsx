import { Alert } from "@/components/atoms/Alert";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { useAppDispatch } from "@/store";
import {
  confirmPassword,
  forgotPassword,
  isCognitoError,
  signIn,
  translateCognitoError,
} from "@/utils/cognito";
import { AuthenticationDetails } from "amazon-cognito-identity-js";

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleLogin } from "./SigninPage";

interface State {
  phase: 1 | 2;
  email: string;
  newPassword: string;
  inProgress: boolean;
  errorMessage?: string;
  verificationCode: string;
}

const RestorePasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [
    { phase, email, errorMessage, newPassword, inProgress, verificationCode },
    setState,
  ] = useState<State>({
    phase: 1,
    email: searchParams.get("email") ?? "",
    newPassword: "",
    inProgress: false,
    verificationCode: "",
  });

  const updateState = (updates: Partial<State>) => {
    setState((state) => ({ ...state, ...updates }));
  };

  const restore = () => {
    updateState({ inProgress: true, errorMessage: undefined });

    try {
      forgotPassword(email.trim());
      updateState({ phase: 2 });
    } catch (err) {
      isCognitoError(err) &&
        updateState({ errorMessage: translateCognitoError(err) });
    } finally {
      updateState({ inProgress: false });
    }
  };

  const confirm = async () => {
    updateState({ inProgress: true, errorMessage: undefined });

    try {
      await confirmPassword(
        email.trim(),
        verificationCode.trim(),
        newPassword.trim()
      );

      const authenticationDetails = new AuthenticationDetails({
        Username: email.trim(),
        Password: newPassword.trim(),
      });

      const session = await signIn(authenticationDetails);
      handleLogin(session, navigate, dispatch);
    } catch (err) {
      isCognitoError(err) &&
        updateState({ errorMessage: translateCognitoError(err) });
    } finally {
      updateState({ inProgress: false });
    }
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      {phase === 1 ? (
        <>
          <Input
            label="E-post"
            value={email}
            onChange={(e) => updateState({ email: e.target.value })}
            tabIndex={1}
          />

          <hr />

          <Alert>{errorMessage}</Alert>
          <Button loading={inProgress} full onClick={restore} disabled={!email}>
            Återställ
          </Button>
        </>
      ) : (
        <>
          <Input
            label="Verifikationskod"
            value={verificationCode}
            onChange={(e) => updateState({ verificationCode: e.target.value })}
            tabIndex={1}
          />
          <Input
            label="Lösenord"
            value={newPassword}
            password
            onChange={(e) => updateState({ newPassword: e.target.value })}
            tabIndex={2}
            autoComplete="new-password"
          />

          <hr />

          <Alert>{errorMessage}</Alert>
          <Button
            loading={inProgress}
            full
            onClick={confirm}
            disabled={!verificationCode || !newPassword}
          >
            Uppdatera
          </Button>
        </>
      )}
    </div>
  );
};

export default RestorePasswordPage;
