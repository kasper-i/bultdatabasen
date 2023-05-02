import configData from "@/config.json";
import { areaSchema } from "@/models/area";
import { Bolt, boltSchema } from "@/models/bolt";
import { cragSchema } from "@/models/crag";
import { Image, imageSchema } from "@/models/image";
import { Point, pointSchema } from "@/models/point";
import {
  ancestorSchema,
  resourceSchema,
  searchResultSchema,
} from "@/models/resource";
import { routeSchema } from "@/models/route";
import { sectorSchema } from "@/models/sector";
import { Task, taskSchema } from "@/models/task";
import { userSchema } from "@/models/user";
import axios, { AxiosRequestHeaders } from "axios";
import { z } from "zod";
import { Comment, commentSchema } from "./models/comment";
import { pageSchema } from "./models/common";
import { manufacturerSchema } from "./models/manufacturer";
import { materialSchema } from "./models/material";
import { modelSchema } from "./models/model";
import { ResourceRole, resourceRoleSchema } from "./models/role";
import { teamSchema } from "./models/team";

export interface Pagination {
  page: number;
  itemsPerPage: number;
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
    const result = await axios.get(`${Api.baseUrl}/users`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(userSchema).parse(result.data);
  };

  static getUserRoles = async (userId: string): Promise<ResourceRole[]> => {
    const endpoint = `/users/${userId}/roles`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(resourceRoleSchema).parse(result.data);
  };

  static getAreas = async (resourceId?: string) => {
    let endpoint: string;
    if (resourceId != null) {
      endpoint = `/resources/${resourceId}/areas`;
    } else {
      endpoint = "/areas";
    }

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(areaSchema).parse(result.data);
  };

  static getArea = async (areaId: string) => {
    const endpoint = `/areas/${areaId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return areaSchema.parse(result.data);
  };

  static getCrag = async (cragId: string) => {
    const endpoint = `/crags/${cragId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return cragSchema.parse(result.data);
  };

  static getSector = async (sectorId: string) => {
    const endpoint = `/sectors/${sectorId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return sectorSchema.parse(result.data);
  };

  static getResource = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return resourceSchema.parse(result.data);
  };

  static getAncestors = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/ancestors`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(ancestorSchema).parse(result.data);
  };

  static getChildren = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/children`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(resourceSchema).parse(result.data);
  };

  static getMaintainers = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/maintainers`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(teamSchema).parse(result.data);
  };

  static getRoute = async (routeId: string) => {
    const endpoint = `/routes/${routeId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return routeSchema.parse(result.data);
  };

  static getRoutes = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/routes`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(routeSchema).parse(result.data);
  };

  static searchResources = async (searchTerm?: string) => {
    const endpoint = `/resources`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
      params: { name: searchTerm },
    });

    return z.array(searchResultSchema).parse(result.data);
  };

  static getBolts = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/bolts`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(boltSchema).parse(result.data);
  };

  static getPoints = async (routeId: string) => {
    const endpoint = `/routes/${routeId}/points`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(pointSchema).parse(result.data);
  };

  static createBolt = async (pointId: string, bolt: Pick<Bolt, "type">) => {
    const endpoint = `/resources/${pointId}/bolts`;

    const result = await axios.post(`${Api.baseUrl}${endpoint}`, bolt, {
      headers: Api.getDefaultHeaders(),
    });

    return boltSchema.parse(result.data);
  };

  static updateBolt = async (boltId: string, updates: Partial<Bolt>) => {
    const endpoint = `/bolts/${boltId}`;

    const result = await axios.put(`${Api.baseUrl}${endpoint}`, updates, {
      headers: Api.getDefaultHeaders(),
    });

    return boltSchema.parse(result.data);
  };

  static deleteBolt = async (boltId: string) => {
    const endpoint = `/bolts/${boltId}`;

    await axios.delete(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });
  };

  static addPoint = async (routeId: string, request: CreatePointRequest) => {
    const endpoint = `/routes/${routeId}/points`;

    const result = await axios.post(`${Api.baseUrl}${endpoint}`, request, {
      headers: Api.getDefaultHeaders(),
    });

    return pointSchema.parse(result.data);
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

    const result = await axios.post(`${Api.baseUrl}${endpoint}`, fd, {
      headers: Api.getDefaultHeaders(),
      onUploadProgress: (progressEvent) =>
        onProgress?.(
          Math.round((progressEvent.loaded * 100) / progressEvent.total)
        ),
    });

    return imageSchema.parse(result.data);
  };

  static getImages = async (pointId: string) => {
    const endpoint = `/resources/${pointId}/images`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(imageSchema).parse(result.data);
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

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
      params: searchParams,
    });

    return pageSchema(taskSchema).parse(result.data);
  };

  static getTask = async (taskId: string) => {
    const endpoint = `/tasks/${taskId}`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
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

    const result = await axios.put(`${Api.baseUrl}${endpoint}`, task, {
      headers: Api.getDefaultHeaders(),
    });

    return taskSchema.parse(result.data);
  };

  static createTask = async (
    parentId: string,
    task: Pick<Task, "description" | "priority">
  ) => {
    const endpoint = `/resources/${parentId}/tasks`;

    const result = await axios.post(`${Api.baseUrl}${endpoint}`, task, {
      headers: Api.getDefaultHeaders(),
    });

    return taskSchema.parse(result.data);
  };

  static getMaterials = async () => {
    const endpoint = `/materials`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(materialSchema).parse(result.data);
  };

  static getManufacturers = async () => {
    const endpoint = `/manufacturers`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(manufacturerSchema).parse(result.data);
  };

  static getModels = async (manufacturerId: string) => {
    const endpoint = `/manufacturers/${manufacturerId}/models`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(modelSchema).parse(result.data);
  };

  static getComments = async (resourceId: string) => {
    const endpoint = `/resources/${resourceId}/comments`;

    const result = await axios.get(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });

    return z.array(commentSchema).parse(result.data);
  };

  static createComment = async (
    resourceId: string,
    comment: Pick<Comment, "text" | "tags">
  ) => {
    const endpoint = `/resources/${resourceId}/comments`;

    const result = await axios.post(`${Api.baseUrl}${endpoint}`, comment, {
      headers: Api.getDefaultHeaders(),
    });

    return commentSchema.parse(result.data);
  };

  static updateComment = async (commentId: string, comment: Comment) => {
    const endpoint = `/comments/${commentId}`;

    const result = await axios.put(`${Api.baseUrl}${endpoint}`, comment, {
      headers: Api.getDefaultHeaders(),
    });

    return commentSchema.parse(result.data);
  };

  static deleteComment = async (commentId: string) => {
    const endpoint = `/comments/${commentId}`;

    await axios.delete(`${Api.baseUrl}${endpoint}`, {
      headers: Api.getDefaultHeaders(),
    });
  };
}
