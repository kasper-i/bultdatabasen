import { Api } from "@/Api";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { login } from "@/slices/authSlice";
import { useAppDispatch } from "@/store";
import {
  confirmPassword,
  forgotPassword,
  parseJwt,
  signin,
  translateCognitoError,
} from "@/utils/cognito";
import { AuthenticationDetails } from "amazon-cognito-identity-js";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RestorePasswordPage = () => {
  const [phase, setPhase] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const restore = () => {
    setInProgress(true);

    try {
      forgotPassword(email);
      setPhase(2);
    } catch (err) {
      console.error(translateCognitoError(err));
    } finally {
      setInProgress(false);
    }
  };

  const confirm = async () => {
    setInProgress(true);

    try {
      await confirmPassword(email, verificationCode, newPassword);

      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: newPassword,
      });

      const result = await signin(authenticationDetails);
      const accessToken = result.getAccessToken().getJwtToken();
      const idToken = result.getIdToken().getJwtToken();
      const refreshToken = result.getRefreshToken().getToken();

      Api.setTokens(idToken, accessToken, refreshToken);

      const returnPath = localStorage.getItem("returnPath");
      localStorage.removeItem("returnPath");

      const { given_name, family_name } = parseJwt(idToken);

      dispatch(login({ firstName: given_name, lastName: family_name }));

      navigate(returnPath != null ? returnPath : "/");
    } catch (err) {
      console.error(translateCognitoError(err));
    } finally {
      setInProgress(false);
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
          />
          <Button
            className="mt-2.5"
            loading={inProgress}
            full
            onClick={restore}
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
            onClick={confirm}
          >
            Bekräfta
          </Button>
        </>
      )}
    </div>
  );
};

export default RestorePasswordPage;
