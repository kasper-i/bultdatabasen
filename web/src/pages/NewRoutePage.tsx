import { RouteForm } from "@/forms/RouteForm";
import { useUnsafeParams } from "@/hooks/common";
import { editableRouteSchema, Route } from "@/models/route";
import { useCreateRoute } from "@/queries/routeQueries";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@mantine/core";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const NewRoutePage = () => {
  const { resourceId: routeId } = useUnsafeParams<"resourceId">();
  const navigate = useNavigate();
  const formMethods = useForm<Route>({
    defaultValues: {},
    resolver: zodResolver(editableRouteSchema),
  });

  const createRoute = useCreateRoute(routeId);

  useEffect(() => {
    if (createRoute.isSuccess) {
      navigate(`/route/${createRoute.data.id}`);
    }
  }, [createRoute.isSuccess]);

  return (
    <Card withBorder>
      <FormProvider {...formMethods}>
        <RouteForm
          loading={createRoute.isLoading}
          onSubmit={(data) => createRoute.mutate(data)}
          onCancel={() => navigate("..")}
        />
      </FormProvider>
    </Card>
  );
};
