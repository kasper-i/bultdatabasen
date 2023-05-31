import { RouteForm } from "@/forms/RouteForm";
import { useUnsafeParams } from "@/hooks/common";
import { editableRouteSchema, Route } from "@/models/route";
import {
  useUpdateRoute as useUpdateRoute,
  useRoute,
} from "@/queries/routeQueries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const EditRoutePage = () => {
  const { resourceId: routeId } = useUnsafeParams<"resourceId">();
  const navigate = useNavigate();

  const updateRoute = useUpdateRoute(routeId);
  const { data: route } = useRoute(routeId);

  const formMethods = useForm<Route>({
    defaultValues: route,
    resolver: zodResolver(editableRouteSchema),
  });

  useEffect(() => {
    if (updateRoute.isSuccess) {
      navigate(`/route/${updateRoute.data.id}`);
    }
  }, [updateRoute.isSuccess]);

  return (
    <FormProvider {...formMethods}>
      <RouteForm
        loading={updateRoute.isLoading}
        onSubmit={(data) => updateRoute.mutate(data)}
        onCancel={() => navigate("..")}
      />
    </FormProvider>
  );
};
