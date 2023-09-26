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
  Anchor,
  Box,
  Button,
  Center,
  Grid,
  Group,
  PasswordInput,
  PinInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconAlertHexagon, IconArrowLeft } from "@tabler/icons-react";
import {
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import classes from "./RegisterPage.module.css";

import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const id = useId();

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
    <>
      {phase === 1 ? (
        <Stack gap="sm">
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
          <Group gap="sm" justify="stretch" grow>
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
          </Group>

          {errorMessage && (
            <Alert
              color="red"
              icon={<IconAlertHexagon />}
              title="Registrering misslyckades"
            >
              {errorMessage}
            </Alert>
          )}
          <Group justify="space-between" mt="lg">
            <Anchor c="dimmed" size="sm" component={Link} to="/auth/signin">
              <Center inline>
                <IconArrowLeft size={14} />
                <Box ml={4}>Tillbaka till inloggingssidan</Box>
              </Center>
            </Anchor>
            <Button
              loading={inProgress}
              onClick={register}
              disabled={!canRegister}
            >
              Registrera
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack align="center" gap="sm">
          <Text ta="center" component="label" size="lg" fw={500}>
            Verifiera din e-post
            <Text c="dimmed" size="sm">
              Skriv in den 6-siffriga koden som skickades till din e-post
            </Text>
          </Text>
          <PinInput
            length={6}
            value={confirmationCode}
            onChange={(value) => updateState({ confirmationCode: value })}
            id={id}
            size="md"
          />

          {errorMessage && (
            <Alert
              color="red"
              icon={<IconAlertHexagon />}
              title="Verifiering misslyckades"
              className={classes.alert}
            >
              {errorMessage}
            </Alert>
          )}

          <Button
            loading={inProgress}
            disabled={confirmationCode.length !== 6}
            onClick={confirm}
          >
            Verifiera
          </Button>
        </Stack>
      )}
    </>
  );
};

export default RegisterPage;
