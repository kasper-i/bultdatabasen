import axios from "axios";
import { User } from "./models/User";

export class Api {
  static baseUrl: string = "https://api.bultdatabasen.se";
  static idToken: string | null;
  static accessToken: string | null;
  static refreshToken: string | null;

  static setTokens = (
    idToken: string,
    accessToken: string,
    refreshToken: string
  ) => {
    Api.idToken = idToken;
    Api.accessToken = accessToken;
    Api.refreshToken = refreshToken;
  };

  static saveTokens = () => {
    if (Api.idToken != null) {
      localStorage.setItem("idToken", Api.idToken);
    }
    if (Api.accessToken != null) {
      localStorage.setItem("accessToken", Api.accessToken);
    }
    if (Api.refreshToken != null) {
      localStorage.setItem("refreshToken", Api.refreshToken);
    }
  };

  static restoreTokens = () => {
    Api.idToken = localStorage.getItem("idToken");
    Api.accessToken = localStorage.getItem("accessToken");
    Api.refreshToken = localStorage.getItem("refreshToken");
  };

  static getMySelf = async () => {
    const result = await axios.get(`${Api.baseUrl}/users/myself`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as User;
  };
}
