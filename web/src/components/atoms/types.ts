export interface Option<T> {
  value: T;
  label: string;
  sublabel?: string;
  key: React.Key;
  disabled?: boolean;
}

export type IconType =
  | "beaker"
  | "cancel"
  | "trash"
  | "upload"
  | "wrench"
  | "check"
  | "external"
  | "arrow left"
  | "unlock"
  | "lock"
  | "paste"
  | "plus"
  | "add"
  | "copy"
  | "home"
  | "image"
  | "camera"
  | "dots"
  | "refresh"
  | "download"
  | "edit"
  | "check badge"
  | "comment"
  | "x"
  | "back"
  | "archive";

export type ColorType = "primary" | "danger" | "white";
