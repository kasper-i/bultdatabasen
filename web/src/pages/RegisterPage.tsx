import { Alert } from "@/components/atoms/Alert";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import {
  confirmRegistration,
  signUp,
  translateCognitoError,
} from "@/utils/cognito";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";

import { useState } from "react";

const RegisterPage = () => {
  const [phase, setPhase] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [givenName, setGivenName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const register = async () => {
    setErrorMessage(undefined);
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

    try {
      const result = await signUp(email, password, attributeList);
      if (!result) {
        return;
      }

      setPhase(2);
    } catch (err) {
      setErrorMessage(translateCognitoError(err));
    }
  };

  const confirm = () => {
    try {
      confirmRegistration(email, confirmationCode);
    } catch (err) {
      setErrorMessage(JSON.stringify(err));
      return;
    }
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      {phase === 1 ? (
        <>
          <Input
            label="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            tabIndex={1}
          />
          <Input
            label="Lösenord"
            value={password}
            password
            onChange={(e) => setPassword(e.target.value)}
            tabIndex={2}
          />
          <div className="flex gap-2.5">
            <Input
              label="Förnamn"
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
              tabIndex={3}
            />
            <Input
              label="Efternamn"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
  );
};

export default RegisterPage;
