import NavigationBar from "@/components/NavigationBar";
import { Box, Stack } from "@mantine/core";
import { Outlet } from "react-router-dom";
import classes from "./Main.module.css";

const Main = () => {
  return (
    <Stack className={classes.main} gap={0}>
      <NavigationBar />
      <Box className={classes.content}>
        <Outlet />
      </Box>
    </Stack>
  );
};

export default Main;
