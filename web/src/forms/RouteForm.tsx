import { Option } from "@/components/atoms/types";
import { Route, RouteType, routeTypes } from "@/models/route";
import { renderRouteType } from "@/utils/routeUtils";
import {
  Button,
  Group,
  NumberInput,
  Select,
  Space,
  TextInput,
} from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import { FC } from "react";
import { Controller, SubmitHandler, useFormContext } from "react-hook-form";
import classes from "./RouteForm.module.css";
import { Spanner } from "@/components/Spanner";

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
  const { control, handleSubmit, register } = useFormContext<Route>();

  return (
    <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
      <Spanner cols={2}>
        <TextInput {...register("name")} label="Lednamn" required />
      </Spanner>

      <Controller
        control={control}
        name="routeType"
        render={({ field: { onChange, value } }) => (
          <Spanner cols={2}>
            <Select
              label="Typ"
              data={routeTypeOptions}
              value={value}
              onSelect={onChange}
              multiple={false}
              required
            />
          </Spanner>
        )}
      />

      <Controller
        control={control}
        name="length"
        render={({ field: { onChange, value } }) => (
          <NumberInput
            label="Längd"
            value={value ? `${value}` : ""}
            onChange={(value) => onChange(Number(value))}
          />
        )}
      />
      <Controller
        control={control}
        name="year"
        render={({ field: { onChange, value } }) => (
          <YearPickerInput
            label="År"
            value={value ? new Date(value) : undefined}
            onChange={(value) => onChange(value?.getFullYear())}
            placeholder="År"
            maxDate={new Date()}
            clearable
          />
        )}
      />

      <Space />

      <Spanner cols={2}>
        <Group justify="end" gap="sm">
          <Button variant="subtle" onClick={onCancel}>
            Avbryt
          </Button>
          <Button loading={loading} type="submit">
            Spara
          </Button>
        </Group>
      </Spanner>
    </form>
  );
};
