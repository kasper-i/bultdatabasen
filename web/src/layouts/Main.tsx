import NavigationBar from "@/components/NavigationBar";
import { Box } from "@mantine/core";
import { Outlet } from "react-router-dom";
import classes from "./Main.module.css";

const Main = () => {
  return (
    <Box className={classes.main}>
      <NavigationBar className={classes.navbar} />
      <Box className={classes.content}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Main;
