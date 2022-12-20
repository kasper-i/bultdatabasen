import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  ISignUpResult,
} from "amazon-cognito-identity-js";
import configData from "@/config.json";

const cognitoUserPool = new CognitoUserPool({
  UserPoolId: configData.COGNITO_POOL_ID,
  ClientId: configData.COGNITO_CLIENT_ID,
});

const makeCognitoUser = (username: string) => {
  const userData = {
    Username: username,
    Pool: cognitoUserPool,
  };

  return new CognitoUser(userData);
};

export const parseJwt = (token: string) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const translateCognitoError = (cognitoError: any) => {
  switch (cognitoError.name) {
    case "NotAuthorizedException":
      return "Fel e-postadress eller lösenord";
    case "CodeMismatchException":
      return "Fel verfikationskod";
    case "ExpiredCodeException":
      return "Verifikationskoden är inte längre giltig";
    case "UserNotConfirmedException":
      return "Kontot är ej verifierat";
    default:
      return "Ett oväntat fel inträffade";
  }
};

export const signin = (authenticationDetails: AuthenticationDetails) => {
  const cognitoUser = makeCognitoUser(authenticationDetails.getUsername());

  return new Promise<CognitoUserSession>((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        resolve(result);
      },

      onFailure: function (err) {
        reject(err);
      },
    });
  });
};

export const confirmRegistration = (
  username: string,
  confirmationCode: string
) => {
  const cognitoUser = makeCognitoUser(username);

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(
      confirmationCode,
      true,
      function (err, result) {
        err ? reject(err) : resolve(result);
      }
    );
  });
};

export const resendConfirmationCode = (username: string) => {
  const cognitoUser = makeCognitoUser(username);

  return new Promise((resolve, reject) => {
    cognitoUser.resendConfirmationCode(function (err, result) {
      err ? reject(err) : resolve(result);
    });
  });
};

export const signUp = (
  username: string,
  password: string,
  attributeList: CognitoUserAttribute[]
) => {
  return new Promise<ISignUpResult | undefined>((resolve, reject) => {
    cognitoUserPool.signUp(
      username,
      password,
      attributeList,
      [],
      (err, result) => {
        err ? reject(err) : resolve(result);
      }
    );
  });
};

export const forgotPassword = (username: string) => {
  const cognitoUser = makeCognitoUser(username);

  return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

export const confirmPassword = (
  username: string,
  verificationCode: string,
  newPassword: string
) => {
  const cognitoUser = makeCognitoUser(username);

  return new Promise<string>((resolve, reject) => {
    cognitoUser.confirmPassword(verificationCode, newPassword, {
      onSuccess(result) {
        resolve(result);
      },
      onFailure(err) {
        reject(err);
      },
    });
  });
};
