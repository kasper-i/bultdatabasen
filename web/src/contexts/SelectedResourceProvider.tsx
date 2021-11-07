import { Resource } from "@/models/resource";
import * as React from "react";
import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";

interface SelectedResourceProviderProps {
  selectedResource: Resource;
  updateSelectedResource: (resource: Resource) => void;
}

const SelectedResourceContext = createContext<
  SelectedResourceProviderProps | undefined
>(undefined);

interface Props {
  children: ReactNode;
}

function SelectedResourceProvider({ children }: Props) {
  const [resource, updateResource] = useState<Resource>({
    id: "7ea1df97-df3a-436b-b1d2-b211f1b9b363",
    type: "root",
  });

  const updateSelectedResource = useCallback(
    (resource: Resource) => updateResource(resource),
    [updateResource]
  );

  const value = useMemo(
    () => ({ selectedResource: resource, updateSelectedResource }),
    [resource, updateSelectedResource]
  );

  return (
    <SelectedResourceContext.Provider value={value}>
      {children}
    </SelectedResourceContext.Provider>
  );
}

function useSelectedResource() {
  const context = React.useContext(SelectedResourceContext);

  if (context === undefined) {
    throw new Error(
      "useSelectedResource must be used within a SelectedResourceProvider"
    );
  }

  return context;
}

export { SelectedResourceProvider, useSelectedResource };
