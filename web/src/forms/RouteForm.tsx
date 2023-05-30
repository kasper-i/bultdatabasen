import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { Option } from "@/components/atoms/RadioGroup";
import { Select } from "@/components/atoms/Select";
import { Route, RouteType, routeTypes } from "@/models/route";
import { renderRouteType } from "@/pages/RoutePage";
import { FC } from "react";
import { Controller, SubmitHandler, useFormContext } from "react-hook-form";

const routeTypeOptions: Option<RouteType>[] = routeTypes.map((type) => ({
  key: type,
  label: renderRouteType(type),
  value: type,
}));

export const RouteForm: FC<{
  loading: boolean;
  onSubmit: SubmitHandler<Route>;
  onCancel: () => void;
}> = ({ loading, onSubmit, onCancel }) => {
  const { control, handleSubmit } = useFormContext<Route>();

  return (
    <form className="grid gap-3 grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <div className="col-span-2">
            <Input label="Lednamn" value={value} onChange={onChange} />
          </div>
        )}
      />

      <Controller
        control={control}
        name="routeType"
        render={({ field: { onChange, value } }) => (
          <div className="col-span-2">
            <Select<RouteType>
              label="Typ"
              options={routeTypeOptions}
              value={value}
              onSelect={onChange}
              multiple={false}
            />
          </div>
        )}
      />

      <Controller
        control={control}
        name="length"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Längd"
            value={value ? Number(value).toString() : ""}
            onChange={(event) => onChange(Number(event.currentTarget.value))}
          />
        )}
      />
      <Controller
        control={control}
        name="year"
        render={({ field: { onChange, value } }) => (
          <Input
            label="År"
            value={value ? Number(value).toString() : ""}
            onChange={(event) => onChange(Number(event.currentTarget.value))}
          />
        )}
      />
      <div className="col-span-2 flex justify-end gap-2">
        <Button outlined onClick={onCancel}>
          Avbryt
        </Button>
        <Button loading={loading} type="submit">
          Spara
        </Button>
      </div>
    </form>
  );
};
