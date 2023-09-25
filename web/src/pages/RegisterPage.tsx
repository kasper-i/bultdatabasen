import { useAppDispatch } from "@/store";
import {
  confirmRegistration,
  isCognitoError,
  signIn,
  signUp,
  translateCognitoError,
} from "@/utils/cognito";
import {
  Alert,
  Button,
  PasswordInput,
  PinInput,
  TextInput,
} from "@mantine/core";
import { IconAlertHexagon } from "@tabler/icons-react";
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
      isCognitoError(err) &&
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

      const session = await signIn(authenticationDetails);
      handleLogin(session, navigate, dispatch);
    } catch (err) {
      isCognitoError(err) &&
        updateState({ errorMessage: translateCognitoError(err) });
    } finally {
      updateState({ inProgress: false });
    }
  };

  const canRegister = !!email && !!password && !!givenName && !!lastName;

  return (
    <div data-tailwind="flex flex-col gap-2.5">
      {phase === 1 ? (
        <>
          <TextInput
            label="E-post"
            value={email}
            onChange={(e) => updateState({ email: e.target.value })}
            tabIndex={1}
            required
          />
          <PasswordInput
            label="Lösenord"
            value={password}
            onChange={(e) => updateState({ password: e.target.value })}
            tabIndex={2}
            autoComplete="new-password"
            required
          />
          <div data-tailwind="flex gap-2.5">
            <TextInput
              label="Förnamn"
              value={givenName}
              onChange={(e) => updateState({ givenName: e.target.value })}
              tabIndex={3}
              required
            />
            <TextInput
              label="Efternamn"
              value={lastName}
              onChange={(e) => updateState({ lastName: e.target.value })}
              tabIndex={4}
              required
            />
          </div>

          {errorMessage && (
            <Alert
              color="red"
              icon={<IconAlertHexagon />}
              title="Registrering misslyckades"
            >
              {errorMessage}
            </Alert>
          )}
          <Button
            loading={inProgress}
            fullWidth
            onClick={register}
            disabled={!canRegister}
          >
            Registrera
          </Button>
        </>
      ) : (
        <>
          <PinInput
            length={6}
            value={confirmationCode}
            onChange={(value) => updateState({ confirmationCode: value })}
          />

          {errorMessage && (
            <Alert
              color="red"
              icon={<IconAlertHexagon />}
              title="Verifiering misslyckades"
            >
              {errorMessage}
            </Alert>
          )}
          <Button loading={inProgress} fullWidth onClick={confirm}>
            Bekräfta
          </Button>
        </>
      )}
    </div>
  );
};

export default RegisterPage;
