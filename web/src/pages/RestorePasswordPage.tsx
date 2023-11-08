import { useAppDispatch } from "@/store";
import {
  confirmPassword,
  forgotPassword,
  isCognitoError,
  signIn,
  translateCognitoError,
} from "@/utils/cognito";
import {
  Alert,
  Anchor,
  Box,
  Button,
  Center,
  Group,
  InputLabel,
  PasswordInput,
  PinInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconAlertHexagon, IconArrowLeft } from "@tabler/icons-react";
import { AuthenticationDetails } from "amazon-cognito-identity-js";

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
    <Stack gap="sm">
      {phase === 1 ? (
        <>
          <TextInput
            label="E-post"
            value={email}
            onChange={(e) => updateState({ email: e.target.value })}
            tabIndex={1}
            required
          />

          {errorMessage && (
            <Alert
              color="red"
              icon={<IconAlertHexagon />}
              title="Operationen misslyckades"
            >
              {errorMessage}
            </Alert>
          )}

          <Group justify="space-between">
            <Anchor c="dimmed" size="sm" component={Link} to="/auth/signin">
              <Center inline>
                <IconArrowLeft size={14} />
                <Box ml={4}>Tillbaka till inloggingssidan</Box>
              </Center>
            </Anchor>
            <Button loading={inProgress} onClick={restore} disabled={!email}>
              Återställ
            </Button>
          </Group>
        </>
      ) : (
        <>
          <Box>
            <InputLabel>
              Återställningskod{" "}
              <Text component="span" c="red" aria-hidden="true">
                {" "}
                *
              </Text>
            </InputLabel>
            <PinInput
              length={6}
              value={verificationCode}
              onChange={(value) => updateState({ verificationCode: value })}
              tabIndex={1}
            />
          </Box>

          <PasswordInput
            label="Lösenord"
            value={newPassword}
            onChange={(e) => updateState({ newPassword: e.target.value })}
            tabIndex={2}
            autoComplete="new-password"
            required
          />

          {errorMessage && (
            <Alert
              color="red"
              icon={<IconAlertHexagon />}
              title="Återställning misslyckades"
            >
              {errorMessage}
            </Alert>
          )}
          <Button
            loading={inProgress}
            onClick={confirm}
            disabled={!verificationCode || !newPassword}
          >
            Uppdatera
          </Button>
        </>
      )}
    </Stack>
  );
};

export default RestorePasswordPage;
