import { Alert } from "@/components/atoms/Alert";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { useAppDispatch } from "@/store";
import {
  confirmPassword,
  forgotPassword,
  signin,
  translateCognitoError,
} from "@/utils/cognito";
import { AuthenticationDetails } from "amazon-cognito-identity-js";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [
    { phase, email, errorMessage, newPassword, inProgress, verificationCode },
    setState,
  ] = useState<State>({
    phase: 1,
    email: "",
    newPassword: "",
    inProgress: false,
    verificationCode: "",
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const updateState = (updates: Partial<State>) => {
    setState((state) => ({ ...state, ...updates }));
  };

  const restore = () => {
    updateState({ inProgress: true, errorMessage: undefined });

    try {
      forgotPassword(email);
      updateState({ phase: 2 });
    } catch (err) {
      updateState({ errorMessage: translateCognitoError(err) });
    } finally {
      updateState({ inProgress: false });
    }
  };

  const confirm = async () => {
    updateState({ inProgress: true, errorMessage: undefined });

    try {
      await confirmPassword(email, verificationCode, newPassword);

      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: newPassword,
      });

      const session = await signin(authenticationDetails);
      handleLogin(session, navigate, dispatch);
    } catch (err) {
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
          />

          <hr />

          <Alert>{errorMessage}</Alert>
          <Button
            className="mt-2.5"
            loading={inProgress}
            full
            onClick={restore}
          >
            Återställ
          </Button>
        </>
      ) : (
        <>
          <Input
            label="Verifikationskod"
            value={verificationCode}
            onChange={(e) => updateState({ verificationCode: e.target.value })}
          />
          <Input
            label="Lösenord"
            value={newPassword}
            password
            onChange={(e) => updateState({ newPassword: e.target.value })}
          />

          <hr />

          <Alert>{errorMessage}</Alert>
          <Button
            className="mt-2.5"
            loading={inProgress}
            full
            onClick={confirm}
          >
            Uppdatera
          </Button>
        </>
      )}
    </div>
  );
};

export default RestorePasswordPage;
