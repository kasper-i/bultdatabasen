import axios, { AxiosResponse } from "axios";
import { Area } from "./models/area";
import { User } from "./models/user";
import configData from "config.json";
import { Resource, ResourceWithParents } from "models/resource";
import { Route } from "models/route";
import { Crag } from "models/crag";
import { Sector } from "models/sector";
import { Bolt } from "models/bolt";
import { Point } from "models/point";
import { Image } from "models/image";
import { queryClient } from "index";

const updateRole = (resourceId: string, response: AxiosResponse) => {
  queryClient.setQueryData(["role", { resourceId }], response.headers["role"]);
};

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

  static clearTokens = () => {
    Api.idToken = null;
    Api.accessToken = null;
    Api.refreshToken = null;

    localStorage.removeItem("idToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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

  static getArea = async (areaId: string): Promise<Area> => {
    const endpoint = `/areas/${areaId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    updateRole(areaId, result);
    return result.data as Area;
  };

  static getCrag = async (cragId: string): Promise<Crag> => {
    const endpoint = `/crags/${cragId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    updateRole(cragId, result);
    return result.data as Crag;
  };

  static getSector = async (sectorId: string): Promise<Sector> => {
    const endpoint = `/sectors/${sectorId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    updateRole(sectorId, result);
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

  static getRoute = async (routeId: string): Promise<Route> => {
    const endpoint = `/routes/${routeId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${Api.accessToken}` },
    });

    updateRole(routeId, result);
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

  static createPoint = async (routeId: string): Promise<Point> => {
    let endpoint = `/routes/${routeId}/points`;

    const result = await axios.post(
      `${Api.baseUrl}${endpoint}`,
      {},
      {
        headers: { Authorization: `Bearer ${Api.accessToken}` },
      }
    );

    return result.data as Point;
  };

  static createConnection = async (
    pointId: string,
    linkedPointId: string
  ): Promise<void> => {
    let endpoint = `/points/${pointId}/outgoing/${linkedPointId}`;

    await axios.put(
      `${Api.baseUrl}${endpoint}`,
      {},
      {
        headers: { Authorization: `Bearer ${Api.accessToken}` },
      }
    );

    return;
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

    return;
  };
}
