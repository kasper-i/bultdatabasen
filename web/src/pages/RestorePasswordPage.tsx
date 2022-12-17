import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { Card } from "@/components/features/routeEditor/Card";
import { AuthenticationDetails } from "amazon-cognito-identity-js";

import { useState } from "react";
import { useCognitoUser } from "./SigninPage";

const RestorePasswordPage = () => {
  const [phase, setPhase] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [inProgress, setInProgress] = useState(false);

  const cognitoUser = useCognitoUser(email);

  const forgotPassword = () => {
    setInProgress(true);

    cognitoUser.forgotPassword({
      onSuccess: () => {
        setPhase(2);
        setInProgress(false);
      },
      onFailure: (err) => {
        console.error(err.message || JSON.stringify(err));
        setInProgress(false);
      },
    });
  };

  const confirmPassword = () => {
    setInProgress(true);

    cognitoUser.confirmPassword(verificationCode, newPassword, {
      onSuccess() {
        setPhase(2);

        const authenticationDetails = new AuthenticationDetails({
          Username: email,
          Password: newPassword,
        });

        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function (result) {
            const accessToken = result.getAccessToken().getJwtToken();
            const idToken = result.getIdToken().getJwtToken();
            const refreshToken = result.getRefreshToken().getToken();

            setInProgress(false);
          },

          onFailure: function (err) {
            console.error(err.message || JSON.stringify(err));
            setInProgress(false);
          },
        });
      },
      onFailure(err) {
        console.log("Password not confirmed!", err);
        setInProgress(false);
      },
    });
  };

  return (
    <div className="w-full mt-20 flex justify-center items-center">
      <div className="w-96">
        <Card>
          <div className="flex flex-col items-center gap-2.5">
            {phase === 1 ? (
              <>
                <Input
                  label="E-post"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  className="mt-2.5"
                  loading={inProgress}
                  full
                  onClick={forgotPassword}
                >
                  Återställ
                </Button>
              </>
            ) : (
              <>
                <Input
                  label="Verifikationskod"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <Input
                  label="Lösenord"
                  value={newPassword}
                  password
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  className="mt-2.5"
                  loading={inProgress}
                  full
                  onClick={confirmPassword}
                >
                  Bekräfta
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RestorePasswordPage;
