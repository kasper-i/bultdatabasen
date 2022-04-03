export const isDefined = <T>(val: T | undefined | null): val is T => {
  return val !== undefined && val !== null;
};

export const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
