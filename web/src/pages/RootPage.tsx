import ChildrenTable from "@/components/ChildrenTable";
import Search from "@/components/Search";
import { rootNodeId } from "@/constants";
import { Stack, Text, Title } from "@mantine/core";
import classes from "./RootPage.module.css";

const RootPage = () => {
  return (
    <Stack align="center" gap="sm">
      <div className={classes.hero}>
        <Title order={1}>bultdatabasen</Title>
        <Text size="sm">
          En databas över borrbultar och ankare på klätterleder i Västsverige.
        </Text>
        <Search className={classes.search} />
      </div>
      <ChildrenTable
        className={classes.container}
        resourceId={rootNodeId}
        filters={{ types: ["area"] }}
      />
    </Stack>
  );
};

export default RootPage;
