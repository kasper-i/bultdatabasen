import { Text } from "@mantine/core";
import { FC } from "react";

export const Counter: FC<{ label: string; count: number }> = ({
  label,
  count,
}) => {
  return (
    <div>
      <Text fw={900} ta="center">
        {count}
      </Text>
      <Text size="xs">{label}</Text>
    </div>
  );
};
