import { RouteForm } from "@/forms/RouteForm";
import { useUnsafeParams } from "@/hooks/common";
import { editableRouteSchema, Route } from "@/models/route";
import {
  useEditRoute as useUpdateRoute,
  useRoute,
} from "@/queries/routeQueries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const EditRoutePage = () => {
  const { resourceId: routeId } = useUnsafeParams<"resourceId">();
  const navigate = useNavigate();

  const updateRoute = useUpdateRoute(routeId);
  const { data: route } = useRoute(routeId);

  const methods = useForm<Route>({
    defaultValues: route,
    resolver: zodResolver(editableRouteSchema),
  });

  useEffect(() => {
    if (updateRoute.isSuccess) {
      navigate(`/route/${updateRoute.data.id}`);
    }
  }, [updateRoute.isSuccess]);

  const onSubmit: SubmitHandler<Route> = (data) => updateRoute.mutate(data);

  return (
    <FormProvider {...methods}>
      <RouteForm loading={updateRoute.isLoading} onSubmit={onSubmit} />
    </FormProvider>
  );
};
