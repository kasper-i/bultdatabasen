import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { Card } from "@/components/features/routeEditor/Card";
import { cognitoClientId, cognitoPoolId } from "@/constants";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

import { useState } from "react";

const SigninPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inProgress, setInProgress] = useState(false);

  const login = () => {
    setInProgress(true);

    try {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const userPool = new CognitoUserPool({
        UserPoolId: cognitoPoolId,
        ClientId: cognitoClientId,
      });

      const userData = {
        Username: email,
        Pool: userPool,
      };

      const cognitoUser = new CognitoUser(userData);

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          const accessToken = result.getAccessToken().getJwtToken();
          const idToken = result.getIdToken().getJwtToken();
          const refreshToken = result.getRefreshToken().getToken();

          const tokens = {
            accessToken,
            idToken,
            refreshToken,
          };

          console.log(tokens);
          setInProgress(false);
        },

        onFailure: function (err) {
          console.error(err.message || JSON.stringify(err));
          setInProgress(false);
        },
      });
    } catch {
      setInProgress(false);
    }
  };

  return (
    <div className="w-full mt-20 flex justify-center items-center">
      <div className="w-96">
        <Card>
          <div className="flex flex-col items-center gap-2.5">
            <Input
              label="E-post"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              className="mt-2.5"
              onClick={login}
              disabled={!email || !password}
              loading={inProgress}
              full
            >
              Logga in
            </Button>
            <a className="text-sm text-purple-600" href="">
              Skapa nytt konto
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SigninPage;
