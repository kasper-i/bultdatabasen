import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { Card } from "@/components/features/routeEditor/Card";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";

import { useState } from "react";
import { useCognitoUser, useCognitoUserPool } from "./SigninPage";

const RegisterPage = () => {
  const [phase, setPhase] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [givenName, setGivenName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [inProgress, setInProgress] = useState(false);

  const cognitoUserPool = useCognitoUserPool();
  const cognitoUser = useCognitoUser(email);

  const register = () => {
    const attributeList: CognitoUserAttribute[] = [];

    attributeList.push(
      new CognitoUserAttribute({
        Name: "given_name",
        Value: givenName,
      })
    );
    attributeList.push(
      new CognitoUserAttribute({
        Name: "family_name",
        Value: lastName,
      })
    );

    cognitoUserPool.signUp(
      email,
      password,
      attributeList,
      [],
      (err, result) => {
        if (err) {
          console.error(err.message || JSON.stringify(err));
          return;
        }

        if (!result) {
          return;
        }

        const cognitoUser = result.user;
        console.log("user name is " + cognitoUser.getUsername());
      }
    );
  };

  const confirm = () => {
    cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      }
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
                <Input
                  label="Lösenord"
                  value={password}
                  password
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex gap-2.5">
                  <Input
                    label="Förnamn"
                    value={givenName}
                    onChange={(e) => setGivenName(e.target.value)}
                  />
                  <Input
                    label="Efternamn"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <Button
                  className="mt-2.5"
                  loading={inProgress}
                  full
                  onClick={register}
                >
                  Registrera
                </Button>
              </>
            ) : (
              <>
                <Input
                  label="Verifikationskod"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                />
                <Input
                  label="Lösenord"
                  value={password}
                  password
                  onChange={(e) => setPassword(e.target.value)}
                />
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
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
