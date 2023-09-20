import React from "react";

export interface Option<T> {
  value: T;
  label: string;
  sublabel?: string;
  key: React.Key;
  disabled?: boolean;
}
