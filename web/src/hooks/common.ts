import { useParams } from "react-router-dom";

export const useUnsafeParams = <
  ParamsOrKey extends string | Record<string, string> = string
>() => {
  return useParams<ParamsOrKey>() as Readonly<
    [ParamsOrKey] extends [string]
      ? {
          readonly [key in ParamsOrKey]: string;
        }
      : ParamsOrKey
  >;
};
