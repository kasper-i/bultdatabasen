import ChildrenTable from "@/components/ChildrenTable";
import Search from "@/components/Search";
import { rootNodeId } from "@/constants";
import { Stack, Text, Title } from "@mantine/core";
import classes from "./RootPage.module.css";

const RootPage = () => {
  return (
    <Stack align="center" gap="sm">
      <Text
        variant="gradient"
        gradient={{ from: "brand.4", to: "brand.6", deg: 90 }}
      >
        <Title order={1}>bultdatabasen</Title>
      </Text>
      <Text ta="center">
        En databas över borrbultar och ankare på klätterleder i Västsverige.
      </Text>
      <Search className={classes.search} />
      <ChildrenTable resourceId={rootNodeId} filters={{ types: ["area"] }} />
    </Stack>
  );
};

export default RootPage;
