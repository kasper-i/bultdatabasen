import configData from "@/config.json";
import { Area } from "@/models/area";
import { Bolt } from "@/models/bolt";
import { Crag } from "@/models/crag";
import { Image } from "@/models/image";
import { Point } from "@/models/point";
import { Resource, ResourceCount, SearchResult } from "@/models/resource";
import { Route } from "@/models/route";
import { Sector } from "@/models/sector";
import { Task } from "@/models/task";
import { User } from "@/models/user";
import { OAuthTokenResponse } from "@/pages/SigninPage";
import axios, { AxiosRequestHeaders } from "axios";
import jwtDecode, { JwtPayload } from "jwt-decode";
import { cognitoClientId, cognitoUrl } from "./constants";
import { ResourceRole } from "./models/role";

export type CreatePointRequest =
  | {
      pointId: string;
      position?: InsertPosition;
    }
  | {
      position?: InsertPosition;
      anchor: Point["anchor"];
      bolts?: Pick<Bolt, "type" | "position">[];
    };

export interface InsertPosition {
  pointId: string;
  order: "before" | "after";
}

export class Api {
  private static baseUrl: string = configData.API_URL;
  static idToken: string | null;
  static accessToken: string | null;
  static refreshToken: string | null;
  private static expirationTime?: number;

  static setTokens = (
    idToken: string,
    accessToken: string,
    refreshToken?: string
  ) => {
    Api.idToken = idToken;
    Api.accessToken = accessToken;
    if (refreshToken !== undefined) {
      Api.refreshToken = refreshToken;
    }

    Api.extractExpirationTime();

    localStorage.setItem("idToken", Api.idToken);
    localStorage.setItem("accessToken", Api.accessToken);

    if (Api.refreshToken !== null) {
      localStorage.setItem("refreshToken", Api.refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }
  };

  static restoreTokens = () => {
    Api.idToken = localStorage.getItem("idToken");
    Api.accessToken = localStorage.getItem("accessToken");
    Api.refreshToken = localStorage.getItem("refreshToken");

    Api.extractExpirationTime();
  };

  static clearTokens = () => {
    Api.idToken = null;
    Api.accessToken = null;
    Api.refreshToken = null;

    localStorage.removeItem("idToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    Api.expirationTime = undefined;
  };

  static extractExpirationTime = () => {
    if (Api.accessToken === null) {
      return;
    }

    const { exp } = jwtDecode<JwtPayload>(Api.accessToken);

    if (exp !== undefined) {
      Api.expirationTime = exp;
    }
  };

  static isExpired = () => {
    if (Api.expirationTime === undefined) {
      return false;
    }

    const currentTime = new Date().getTime() / 1000;

    return currentTime > Api.expirationTime;
  };

  static authValid = () => {
    return Api.accessToken !== null;
  };

  static refreshTokens = async () => {
    if (Api.refreshToken === null) {
      return Promise.reject();
    }

    const instance = axios.create({
      baseURL: cognitoUrl,
      timeout: 10000,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", cognitoClientId);
    params.append("refresh_token", Api.refreshToken);

    await instance.post("/oauth2/token", params).then((response) => {
      const { id_token, access_token }: OAuthTokenResponse = response.data;

      Api.setTokens(id_token, access_token);
    });

    return Promise.resolve();
  };

  private static getDefaultHeaders = (): AxiosRequestHeaders => ({
    Authorization: `Bearer ${Api.accessToken}`,
  });

  static getUserNames = async () => {
    const result = await axios.get<
      Pick<User, "id" | "firstName" | "lastName">[]
    >(`${Api.baseUrl}/users/names`, { headers: Api.getDefaultHeaders() });

    return result.data;
  };

  static getMyself = async () => {
    const result = await axios.get<User>(`${Api.baseUrl}/users/myself`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static updateMyself = async (user: Omit<User, "id" | "firstSeen">) => {
    await axios.put(`${Api.baseUrl}/users/myself`, user, {
      headers: Api.getDefaultHeaders(),
    });
  };

  static getUserRoleForResource = async (
    resourceId: string
  ): Promise<ResourceRole> => {
    const endpoint = `/resources/${resourceId}/role`;

    const result = await axios.get<ResourceRole>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static getAreas = async (resourceId?: string) => {
    let endpoint: string;
    if (resourceId != null) {
      endpoint = `/resources/${resourceId}/areas`;
    } else {
      endpoint = "/areas";
    }

    const result = await axios.get<Area[]>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static getArea = async (areaId: string) => {
    const endpoint = `/areas/${areaId}`;

    const result = await axios.get<Area>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static getCrag = async (cragId: string) => {
    const endpoint = `/crags/${cragId}`;

    const result = await axios.get<Crag>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static getSector = async (sectorId: string) => {
    const endpoint = `/sectors/${sectorId}`;

    const result = await axios.get<Sector>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static getResource = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}`;

    const result = await axios.get<Resource>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static getAncestors = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/ancestors`;

    const result = await axios.get<Resource[]>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static getChildren = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/children`;

    const result = await axios.get<Resource[]>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static getCounts = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/counts`;

    const result = await axios.get<ResourceCount[]>(
      `${Api.baseUrl}${endpoint}`,
      { headers: Api.getDefaultHeaders() }
    );

    return result.data;
  };

  static getRoute = async (routeId: string) => {
    const endpoint = `/routes/${routeId}`;

    const result = await axios.get<Route>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static getRoutes = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/routes`;

    const result = await axios.get<Route[]>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static searchResources = async (searchTerm?: string) => {
    const endpoint = `/resources`;

    const result = await axios.get<SearchResult[]>(
      `${Api.baseUrl}${endpoint}`,
      {
        headers: Api.getDefaultHeaders(),
        params: { name: searchTerm },
      }
    );

    return result.data;
  };

  static getBolts = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/bolts`;

    const result = await axios.get<Bolt[]>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static getPoints = async (routeId: string) => {
    const endpoint = `/routes/${routeId}/points`;

    const result = await axios.get<Point[]>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static createBolt = async (pointId: string, bolt: Pick<Bolt, "type">) => {
    const endpoint = `/resources/${pointId}/bolts`;

    const result = await axios.post<Bolt>(`${Api.baseUrl}${endpoint}`, bolt, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static deleteBolt = async (boltId: string) => {
    const endpoint = `/bolts/${boltId}`;

    await axios.delete(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });
  };

  static addPoint = async (routeId: string, request: CreatePointRequest) => {
    const endpoint = `/routes/${routeId}/points`;

    const result = await axios.post<Point>(
      `${Api.baseUrl}${endpoint}`,
      request,
      { headers: Api.getDefaultHeaders() }
    );

    return result.data;
  };

  static detachPoint = async (routeId: string, pointId: string) => {
    const endpoint = `/routes/${routeId}/points/${pointId}`;

    await axios.delete(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });
  };

  static uploadImage = async (
    pointId: string,
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    const endpoint = `/resources/${pointId}/images`;

    const fd = new FormData();
    fd.append("image", file);

    await axios.post(`${Api.baseUrl}${endpoint}`, fd, {
      headers: Api.getDefaultHeaders(),
      onUploadProgress: (progressEvent) =>
        onProgress?.(
          Math.round((progressEvent.loaded * 100) / progressEvent.total)
        ),
    });
  };

  static getImages = async (pointId: string) => {
    const endpoint = `/resources/${pointId}/images`;

    const result = await axios.get<Image[]>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static deleteImage = async (imageId: string) => {
    const endpoint = `/images/${imageId}`;

    await axios.delete(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });
  };

  static updateImage = async (
    imageId: string,
    patch: Pick<Image, "rotation">
  ) => {
    const endpoint = `/images/${imageId}`;

    await axios.patch(`${Api.baseUrl}${endpoint}`, patch, {
      headers: {
        ...Api.getDefaultHeaders(),
        "Content-Type": "application/merge-patch+json",
      },
    });
  };

  static getTasks = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/tasks`;

    const result = await axios.get<Task[]>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static getTask = async (taskId: string) => {
    const endpoint = `/tasks/${taskId}`;

    const result = await axios.get<Task>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static deleteTask = async (taskId: string) => {
    const endpoint = `/tasks/${taskId}`;

    await axios.delete(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });
  };

  static updateTask = async (taskId: string, task: Task) => {
    const endpoint = `/tasks/${taskId}`;

    const result = await axios.put<Task>(`${Api.baseUrl}${endpoint}`, task, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static createTask = async (
    parentId: string,
    task: Pick<Task, "description">
  ) => {
    const endpoint = `/resources/${parentId}/tasks`;

    const result = await axios.post<Task>(`${Api.baseUrl}${endpoint}`, task, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };
}
