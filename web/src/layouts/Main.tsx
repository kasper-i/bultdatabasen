import NavigationBar from "@/components/NavigationBar";
import { Flex, Stack } from "@mantine/core";
import { Outlet } from "react-router-dom";
import classes from "./Main.module.css";

const Main = () => {
  return (
    <Stack className={classes.main} gap={0}>
      <NavigationBar />
      <Flex className={classes.content}>
        <Outlet />
      </Flex>
    </Stack>
  );
};

export default Main;
