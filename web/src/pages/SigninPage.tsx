import {
  AuthenticationDetails,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

import { Api } from "@/Api";
import { login } from "@/slices/authSlice";
import { useAppDispatch } from "@/store";
import {
  signIn as cognitoSignin,
  confirmRegistration,
  isCognitoError,
  resendConfirmationCode,
  translateCognitoError,
} from "@/utils/cognito";
import {
  Alert,
  Anchor,
  Button,
  Group,
  PasswordInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { IconAlertHexagon } from "@tabler/icons-react";
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
  const idToken = session.getIdToken();

  Api.setAccessToken(accessToken);
  const {
    sub: userId,
    email,
    given_name: firstName,
    family_name: lastName,
  } = idToken.decodePayload();

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
    <Stack gap="sm">
      <TextInput
        label="E-postadress"
        value={email}
        onChange={(e) => updateState({ email: e.target.value })}
        tabIndex={1}
        disabled={requireConfirmationCode}
        required
      />
      <PasswordInput
        label="Lösenord"
        value={password}
        onChange={(e) => updateState({ password: e.target.value })}
        tabIndex={2}
        disabled={requireConfirmationCode}
        required
      />
      {requireConfirmationCode ? (
        <TextInput
          label="Verifikationskod"
          value={confirmationCode}
          onChange={(e) => updateState({ confirmationCode: e.target.value })}
          tabIndex={3}
        />
      ) : (
        <Anchor
          size="sm"
          component={Link}
          to={`/auth/forgot-password?email=${email}`}
          replace
        >
          Glömt lösenord?
        </Anchor>
      )}

      {errorMessage && (
        <Alert
          color="red"
          icon={<IconAlertHexagon />}
          title="Inloggning misslyckades"
        >
          {errorMessage}
        </Alert>
      )}
      <Group justify="space-between">
        <Anchor
          size="sm"
          c="dimmed"
          variant="subtle"
          component={Link}
          to="/auth/register"
          replace
        >
          Saknar du konto? Registrera
        </Anchor>
        <Button onClick={signin} disabled={!canSubmit} loading={inProgress}>
          Logga in
        </Button>
      </Group>
    </Stack>
  );
};

export default SigninPage;
