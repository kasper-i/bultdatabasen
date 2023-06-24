import configData from "@/config.json";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  ISignUpResult,
} from "amazon-cognito-identity-js";

const cognitoUserPool = new CognitoUserPool({
  UserPoolId: configData.COGNITO_POOL_ID,
  ClientId: configData.COGNITO_CLIENT_ID,
});

export type CognitoExceptions =
  | "NotAuthorizedException"
  | "CodeMismatchException"
  | "ExpiredCodeException"
  | "UserNotConfirmedException"
  | "LimitExceededException"
  | "InvalidPasswordException"
  | "UsernameExistsException"
  | "InvalidParameterException";

export interface CognitoError {
  name: CognitoExceptions | string;
}

export const isCognitoError = (error: unknown): error is CognitoError => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return "name" in (error as any);
};

const makeCognitoUser = (username: string) => {
  const userData = {
    Username: username,
    Pool: cognitoUserPool,
  };

  return new CognitoUser(userData);
};

export const translateCognitoError = (cognitoError: CognitoError) => {
  switch (cognitoError.name) {
    case "NotAuthorizedException":
      return "Fel e-postadress eller lösenord";
    case "CodeMismatchException":
      return "Fel verifikationskod";
    case "ExpiredCodeException":
      return "Verifikationskoden är inte längre giltig";
    case "UserNotConfirmedException":
      return "Kontot är ej verifierat";
    case "LimitExceededException":
      return "För många försök under kort period";
    case "InvalidPasswordException":
      return "Lösenordet måste vara minst 8 tecken långt";
    case "UsernameExistsException":
      return "E-postadressen är redan använd";
    case "InvalidParameterException":
      return "Felaktigt format";
    default:
      return "Ett oväntat fel inträffade";
  }
};

export const getCurrentUser = () => cognitoUserPool.getCurrentUser();

export const refreshSession = (force?: boolean) => {
  const cognitoUser = getCurrentUser();
  if (!cognitoUser) {
    return Promise.reject();
  }

  return new Promise<string | null>((resolve, reject) => {
    cognitoUser.getSession((err: null, session: CognitoUserSession) => {
      if (err) {
        return reject(err);
      }

      const accessToken = session.getAccessToken();
      const expired = accessToken.getExpiration() < new Date().getTime() / 1000;

      if (!expired && force !== true) {
        return resolve(null);
      }

      cognitoUser.refreshSession(
        session.getRefreshToken(),
        (err, result: { accessToken: { jwtToken: string } }) => {
          err ? reject(err) : resolve(result.accessToken.jwtToken);
        }
      );
    });
  });
};

export const signIn = (authenticationDetails: AuthenticationDetails) => {
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

export const signOut = () => {
  const cognitoUser = getCurrentUser();
  if (!cognitoUser) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    cognitoUser.signOut(() => {
      resolve();
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
