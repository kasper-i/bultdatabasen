import configData from "@/config.json";
import { Area } from "@/models/area";
import { Bolt, boltSchema } from "@/models/bolt";
import { Crag } from "@/models/crag";
import { Image } from "@/models/image";
import { Point } from "@/models/point";
import {
  ancestorSchema,
  resourceSchema,
  SearchResult,
} from "@/models/resource";
import { Route, routeSchema } from "@/models/route";
import { Sector } from "@/models/sector";
import { Task, taskSchema } from "@/models/task";
import { User } from "@/models/user";
import axios, { AxiosRequestHeaders } from "axios";
import { z } from "zod";
import { Manufacturer } from "./models/manufacturer";
import { materialSchema } from "./models/material";
import { Model } from "./models/model";
import { ResourceRole } from "./models/role";

export interface Pagination {
  page: number;
  itemsPerPage: number;
}

export interface Meta {
  totalItems: number;
}

export interface GetTasksOptions {
  status?: string[];
  pagination?: Pagination;
}

export type CreatePointRequest = { position?: InsertPosition } & (
  | {
      pointId: string;
    }
  | {
      pointId: undefined;
      anchor: Point["anchor"];
      bolts: Omit<Bolt, "id" | "parentId">[];
    }
);

export interface InsertPosition {
  pointId: string;
  order: "before" | "after";
}

export class Api {
  private static baseUrl: string = configData.API_URL;
  static accessToken: string | null;

  static setAccessToken = (accessToken: string) => {
    Api.accessToken = accessToken;
  };

  static clearAccessToken = () => {
    Api.accessToken = null;
  };

  private static getDefaultHeaders = (): AxiosRequestHeaders => ({
    Authorization: `Bearer ${Api.accessToken}`,
  });

  static getUsers = async () => {
    const result = await axios.get<User[]>(`${Api.baseUrl}/users`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };

  static getUserRoles = async (userId: string): Promise<ResourceRole[]> => {
    const endpoint = `/users/${userId}/roles`;

    const result = await axios.get<ResourceRole[]>(
      `${Api.baseUrl}${endpoint}`,
      {
        headers: Api.getDefaultHeaders(),
      }
    );

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

    const result = await axios.get<object>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return resourceSchema.parse(result.data);
  };

  static getAncestors = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/ancestors`;

    const result = await axios.get<object>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(ancestorSchema).parse(result.data);
  };

  static getChildren = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/children`;

    const result = await axios.get<object>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(resourceSchema).parse(result.data);
  };

  static getRoute = async (routeId: string) => {
    const endpoint = `/routes/${routeId}`;

    const result = await axios.get<object>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return routeSchema.parse(result.data);
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

    const result = await axios.get<object>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(boltSchema).parse(result.data);
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

  static updateBolt = async (boltId: string, updates: Partial<Bolt>) => {
    const endpoint = `/bolts/${boltId}`;

    const result = await axios.put<Bolt>(`${Api.baseUrl}${endpoint}`, updates, {
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

  static getTasks = async (resourceId: string, options: GetTasksOptions) => {
    const endpoint = `/resources/${resourceId}/tasks`;

    const { pagination, status } = options;
    const searchParams = new URLSearchParams();
    status?.forEach((s) => searchParams.append("status", s));

    if (pagination) {
      searchParams.append("page", pagination.page.toString());
      searchParams.append("itemsPerPage", pagination.itemsPerPage.toString());
    }

    const {
      data: { data, meta },
    } = await axios.get<{ data: object; meta: Meta }>(
      `${Api.baseUrl}${endpoint}`,
      {
        headers: Api.getDefaultHeaders(),
        params: searchParams,
      }
    );

    return {
      data: z.array(taskSchema).parse(data),
      meta,
    };
  };

  static getTask = async (taskId: string) => {
    const endpoint = `/tasks/${taskId}`;

    const result = await axios.get<object>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return taskSchema.parse(result.data);
  };

  static deleteTask = async (taskId: string) => {
    const endpoint = `/tasks/${taskId}`;

    await axios.delete(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });
  };

  static updateTask = async (taskId: string, task: Task) => {
    const endpoint = `/tasks/${taskId}`;

    const result = await axios.put<object>(`${Api.baseUrl}${endpoint}`, task, {
      headers: Api.getDefaultHeaders(),
    });

    return taskSchema.parse(result.data);
  };

  static createTask = async (
    parentId: string,
    task: Pick<Task, "description" | "priority">
  ) => {
    const endpoint = `/resources/${parentId}/tasks`;

    const result = await axios.post<object>(`${Api.baseUrl}${endpoint}`, task, {
      headers: Api.getDefaultHeaders(),
    });

    return taskSchema.parse(result.data);
  };

  static getMaterials = async () => {
    const endpoint = `/materials`;

    const result = await axios.get<object>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(materialSchema).parse(result.data);
  };

  static getManufacturers = async () => {
    const endpoint = `/manufacturers`;

    const result = await axios.get<Manufacturer[]>(
      `${Api.baseUrl}${endpoint}`,
      {
        headers: Api.getDefaultHeaders(),
      }
    );

    return result.data;
  };

  static getModels = async (manufacturerId: string) => {
    const endpoint = `/manufacturers/${manufacturerId}/models`;

    const result = await axios.get<Model[]>(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return result.data;
  };
}
