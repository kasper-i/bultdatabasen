import { Alert } from "@/components/atoms/Alert";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { useAppDispatch } from "@/store";
import {
  confirmRegistration,
  signin,
  signUp,
  translateCognitoError,
} from "@/utils/cognito";
import {
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogin } from "./SigninPage";

interface State {
  phase: 1 | 2;
  email: string;
  password: string;
  givenName: string;
  lastName: string;
  confirmationCode: string;
  inProgress: boolean;
  errorMessage?: string;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [
    {
      phase,
      email,
      password,
      givenName,
      lastName,
      confirmationCode,
      inProgress,
      errorMessage,
    },
    setState,
  ] = useState<State>({
    phase: 1,
    email: "",
    password: "",
    givenName: "",
    lastName: "",
    confirmationCode: "",
    inProgress: false,
  });

  const updateState = (updates: Partial<State>) => {
    setState((state) => ({ ...state, ...updates }));
  };

  const register = async () => {
    updateState({ inProgress: true, errorMessage: undefined });

    const attributeList: CognitoUserAttribute[] = [];

    attributeList.push(
      new CognitoUserAttribute({
        Name: "given_name",
        Value: givenName.trim(),
      })
    );
    attributeList.push(
      new CognitoUserAttribute({
        Name: "family_name",
        Value: lastName.trim(),
      })
    );

    try {
      const result = await signUp(email.trim(), password.trim(), attributeList);
      if (!result) {
        return;
      }

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
      confirmRegistration(email.trim(), confirmationCode.trim());

      const authenticationDetails = new AuthenticationDetails({
        Username: email.trim(),
        Password: password.trim(),
      });

      const session = await signin(authenticationDetails);
      handleLogin(session, navigate, dispatch);
    } catch (err) {
      updateState({ errorMessage: translateCognitoError(err) });
    } finally {
      updateState({ inProgress: false });
    }
  };

  const canRegister = !!email && !!password && !!givenName && !!lastName;

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
          <Input
            label="Lösenord"
            value={password}
            password
            onChange={(e) => updateState({ password: e.target.value })}
            tabIndex={2}
          />
          <div className="flex gap-2.5">
            <Input
              label="Förnamn"
              value={givenName}
              onChange={(e) => updateState({ givenName: e.target.value })}
              tabIndex={3}
            />
            <Input
              label="Efternamn"
              value={lastName}
              onChange={(e) => updateState({ lastName: e.target.value })}
              tabIndex={4}
            />
          </div>

          <hr />

          <Alert>{errorMessage}</Alert>
          <Button
            className="mt-2.5"
            loading={inProgress}
            full
            onClick={register}
            disabled={!canRegister}
          >
            Registrera
          </Button>
        </>
      ) : (
        <>
          <Input
            label="Verifikationskod"
            value={confirmationCode}
            onChange={(e) => updateState({ confirmationCode: e.target.value })}
          />

          <hr />

          <Alert>{errorMessage}</Alert>
          <Button
            className="mt-2.5"
            loading={inProgress}
            full
            onClick={confirm}
          >
            Bekräfta
          </Button>
        </>
      )}
    </div>
  );
};

export default RegisterPage;
