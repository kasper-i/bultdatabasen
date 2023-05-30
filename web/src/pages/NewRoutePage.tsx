import { RouteForm } from "@/forms/RouteForm";
import { useUnsafeParams } from "@/hooks/common";
import { editableRouteSchema, Route } from "@/models/route";
import { useCreateRoute } from "@/queries/routeQueries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const NewRoutePage = () => {
  const { resourceId } = useUnsafeParams<"resourceId">();
  const navigate = useNavigate();
  const methods = useForm<Route>({
    defaultValues: {},
    resolver: zodResolver(editableRouteSchema),
  });

  const createRoute = useCreateRoute(resourceId);

  useEffect(() => {
    if (createRoute.isSuccess) {
      navigate(`/route/${createRoute.data.id}`);
    }
  }, [createRoute.isSuccess]);

  const onSubmit: SubmitHandler<Route> = (data) => createRoute.mutate(data);

  return (
    <FormProvider {...methods}>
      <RouteForm
        loading={createRoute.isLoading}
        onSubmit={onSubmit}
        onCancel={() => navigate("..")}
      />
    </FormProvider>
  );
};
