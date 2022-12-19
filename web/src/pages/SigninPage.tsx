import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { Card } from "@/components/features/routeEditor/Card";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import configData from "@/config.json";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@/components/atoms/Alert";

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

const SigninPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const cognitoUser = useCognitoUser(email);

  const login = () => {
    setInProgress(true);
    setErrorMessage(undefined);

    try {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          const accessToken = result.getAccessToken().getJwtToken();
          const idToken = result.getIdToken().getJwtToken();
          const refreshToken = result.getRefreshToken().getToken();

          setInProgress(false);
        },

        onFailure: function (err) {
          setErrorMessage(err.message || JSON.stringify(err));
          setInProgress(false);
        },
      });
    } catch {
      setInProgress(false);
    }
  };

  return (
    <div className="w-full mt-20 flex justify-center items-center">
      <div className="min-w-96">
        <Card>
          <div className="flex flex-col items-center gap-2.5">
            <Input
              label="E-post"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Lösenord"
              password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Link
              to="/signin/forgot-password"
              className="text-sm text-purple-600 self-start"
            >
              Återställ lösenord
            </Link>

            <hr />

            <Alert>{errorMessage}</Alert>
            <Button
              onClick={login}
              disabled={!email || !password}
              loading={inProgress}
              full
            >
              Logga in
            </Button>
            <Link to="/signin/register">
              <span className="text-sm text-purple-600">Skapa nytt konto</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SigninPage;
