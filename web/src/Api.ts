import axios, { AxiosResponse } from "axios";
import configData from "@/config.json";
import { queryClient } from "@/index";
import jwtDecode, { JwtPayload } from "jwt-decode";
import { Bolt } from "@/models/bolt";
import { Crag } from "@/models/crag";
import { Image } from "@/models/image";
import { Point } from "@/models/point";
import {
  Resource,
  ResourceCount,
  ResourceWithParents,
} from "@/models/resource";
import { Route } from "@/models/route";
import { Sector } from "@/models/sector";
import { Task } from "@/models/task";
import { OAuthTokenResponse } from "@/pages/SigninPage";
import { Area } from "@/models/area";
import { User } from "@/models/user";
import { ResourceRole } from "./models/role";

export interface CreatePointRequest {
  pointId?: string;
  position?: InsertPosition;
  bolts?: Pick<Bolt, "type">[];
}

export interface InsertPosition {
  pointId: string;
  order: "before" | "after";
}

export class Api {
  static baseUrl: string = configData.API_URL;
  static idToken: string | null;
  static accessToken: string | null;
  static refreshToken: string | null;
  static expirationTime?: number;

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

    if (Api.refreshToken != null) {
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
    if (Api.accessToken == null) {
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

    if (currentTime > Api.expirationTime) {
      return true;
    }

    return false;
  };

  static authValid = () => {
    return Api.accessToken != null;
  };

  static refreshTokens = async () => {
    if (Api.refreshToken == null) {
      return Promise.reject();
    }

    const instance = axios.create({
      baseURL: "https://bultdatabasen.auth.eu-west-1.amazoncognito.com",
      timeout: 10000,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", "4bc4eb6q54d9poodouksahhk86");
    params.append("refresh_token", Api.refreshToken);

    await instance.post("/oauth2/token", params).then((response) => {
      const { id_token, access_token }: OAuthTokenResponse = response.data;

      Api.setTokens(id_token, access_token);
    });

    return Promise.resolve();
  };

  static getMyself = async (): Promise<User> => {
    const result = await axios.get(`${Api.baseUrl}/users/myself`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as User;
  };

  static updateMyself = async (
    user: Omit<User, "id" | "firstSeen">
  ): Promise<void> => {
    await axios.put(`${Api.baseUrl}/users/myself`, user, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return;
  };

  static getUserRoleForResource = async (
    resourceId: string
  ): Promise<ResourceRole> => {
    let endpoint = `/resources/${resourceId}/role`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as ResourceRole;
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

  static getArea = async (areaId: string): Promise<Area> => {
    const endpoint = `/areas/${areaId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Area;
  };

  static getCrag = async (cragId: string): Promise<Crag> => {
    const endpoint = `/crags/${cragId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Crag;
  };

  static getSector = async (sectorId: string): Promise<Sector> => {
    const endpoint = `/sectors/${sectorId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Sector;
  };

  static getAncestors = async (resourceId: string): Promise<Resource[]> => {
    const endpoint = `/resources/${resourceId}/ancestors`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Resource[];
  };

  static getChildren = async (resourceId: string): Promise<Resource[]> => {
    const endpoint = `/resources/${resourceId}/children`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Resource[];
  };

  static getCounts = async (resourceId: string): Promise<ResourceCount[]> => {
    const endpoint = `/resources/${resourceId}/counts`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as ResourceCount[];
  };

  static getRoute = async (routeId: string): Promise<Route> => {
    const endpoint = `/routes/${routeId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Route;
  };

  static searchResources = async (
    searchTerm?: string
  ): Promise<ResourceWithParents[]> => {
    const endpoint = `/resources`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
      params: { name: searchTerm },
    });

    return result.data as ResourceWithParents[];
  };

  static getBolts = async (resourceId: string): Promise<Bolt[]> => {
    let endpoint = `/resources/${resourceId}/bolts`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Bolt[];
  };

  static getPoints = async (routeId: string): Promise<Point[]> => {
    let endpoint = `/routes/${routeId}/points`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Point[];
  };

  static createBolt = async (
    pointId: string,
    bolt: Pick<Bolt, "type">
  ): Promise<Bolt> => {
    let endpoint = `/resources/${pointId}/bolts`;

    const result = await axios.post(`${Api.baseUrl}${endpoint}`, bolt, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Bolt;
  };

  static deleteBolt = async (boltId: string): Promise<void> => {
    let endpoint = `/bolts/${boltId}`;

    await axios.delete(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });
  };

  static addPoint = async (
    routeId: string,
    request: CreatePointRequest
  ): Promise<Point> => {
    let endpoint = `/routes/${routeId}/points`;

    const result = await axios.post(`${Api.baseUrl}${endpoint}`, request, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Point;
  };

  static detachPoint = async (
    routeId: string,
    pointId: string
  ): Promise<void> => {
    let endpoint = `/routes/${routeId}/points/${pointId}`;

    const result = await axios.delete(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data;
  };

  static uploadImage = async (
    pointId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    let endpoint = `/resources/${pointId}/images`;

    let fd = new FormData();
    fd.append("image", file);

    await axios.post(`${Api.baseUrl}${endpoint}`, fd, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
      onUploadProgress: (progressEvent) =>
        onProgress?.(
          Math.round((progressEvent.loaded * 100) / progressEvent.total)
        ),
    });

    return;
  };

  static getImages = async (pointId: string): Promise<Image[]> => {
    let endpoint = `/resources/${pointId}/images`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Image[];
  };

  static deleteImage = async (imageId: string): Promise<void> => {
    let endpoint = `/images/${imageId}`;

    await axios.delete(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });
  };

  static updateImage = async (
    imageId: string,
    patch: Pick<Image, "rotation">
  ): Promise<void> => {
    let endpoint = `/images/${imageId}`;

    await axios.patch(`${Api.baseUrl}${endpoint}`, patch, {
      headers: {
        Authorization: `Bearer ${Api.accessToken}`,
        "Content-Type": "application/merge-patch+json",
      },
    });
  };

  static getTasks = async (resourceId: string): Promise<Task[]> => {
    const endpoint = `/resources/${resourceId}/tasks`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Task[];
  };

  static getTask = async (taskId: string): Promise<Task> => {
    const endpoint = `/tasks/${taskId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Task;
  };

  static deleteTask = async (taskId: string): Promise<void> => {
    const endpoint = `/tasks/${taskId}`;

    await axios.delete(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });
  };

  static updateTask = async (taskId: string, task: Task): Promise<Task> => {
    const endpoint = `/tasks/${taskId}`;

    const result = await axios.put(`${Api.baseUrl}${endpoint}`, task, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Task;
  };

  static createTask = async (
    parentId: string,
    task: Pick<Task, "description">
  ): Promise<Task> => {
    const endpoint = `/resources/${parentId}/tasks`;

    const result = await axios.post(`${Api.baseUrl}${endpoint}`, task, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    return result.data as Task;
  };
}
