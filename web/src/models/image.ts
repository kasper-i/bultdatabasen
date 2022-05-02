import { ResourceBase } from "./resource";

export type ImageRotation = 0 | 90 | 180 | 270;

export type ImageVersion = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export type Image = ResourceBase & {
  mimeType: string;
  timestamp: string;
  description?: string;
  rotation?: ImageRotation;
  size: number;
  width: number;
  height: number;
  uploadedBy: string;
};
