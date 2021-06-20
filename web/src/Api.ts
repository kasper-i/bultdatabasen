import axios from "axios";
import { Area } from "./models/area";
import { User } from "./models/user";
import configData from "config.json";
import { Resource, ResourceWithParents } from "models/resource";
import { Route } from "models/route";

export class Api {
  static baseUrl: string = configData.API_URL;
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

  static authValid = () => {
    return Api.accessToken != null;
  };

  static getMySelf = async (): Promise<User> => {
    const result = await axios.get(`${Api.baseUrl}/users/myself`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as User;
  };

  static getAreas = async (resourceId?: string): Promise<Area[]> => {
    let endpoint: string;
    if (resourceId != null) {
      endpoint = `/resources/${resourceId}/areas`;
    } else {
      endpoint = "/areas";
    }

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Area[];
  };

  static getArea = async (areaId?: string): Promise<Area> => {
    const endpoint = `/areas/${areaId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Area;
  };

  static getAncestors = async (resourceId?: string): Promise<Resource[]> => {
    const endpoint = `/resources/${resourceId}/ancestors`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Resource[];
  };

  static getRoute = async (routeId?: string): Promise<Route> => {
    const endpoint = `/routes/${routeId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Route;
  };

  static searchResources = async (searchTerm?: string): Promise<ResourceWithParents[]> => {
    const endpoint = `/resources`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
      params: {name: searchTerm}
    });

    return result.data as ResourceWithParents[];
  };
}
