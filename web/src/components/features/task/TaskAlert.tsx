import { Alert, Anchor, Button, Group } from "@mantine/core";
import { IconChecks, IconTools } from "@tabler/icons-react";
import { FC } from "react";
import { Link } from "react-router-dom";

export const TaskAlert: FC<{ openTasks: number }> = ({ openTasks }) => {
  const issue = `${openTasks} ${
    openTasks === 1 ? "ohanterat" : "ohanterade"
  } problem`;

  if (openTasks === 0) {
    return (
      <Alert
        color="green"
        icon={<IconChecks />}
        title="Inga rapporterade problem"
      >
        <Anchor component={Link} to="tasks">
          <Button color="green" variant="outline">
            Rapportera nytt problem
          </Button>
        </Anchor>
      </Alert>
    );
  }

  return (
    <Alert color="yellow" icon={<IconTools />} title={issue}>
      <Group justify="space-between">
        <div>Det finns {issue}.</div>
        <Anchor component={Link} to="tasks">
          <Button color="yellow" variant="outline">
            Visa
          </Button>
        </Anchor>
      </Group>
    </Alert>
  );
};
