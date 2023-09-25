import { ReactElement } from "react";
import { useLocation } from "react-router-dom";
import LoginToolbar from "./LoginToolbar";
import Search from "./Search";
import classes from "./NavigationBar.module.css";
import { Flex } from "@mantine/core";

const NavigationBar = (): ReactElement => {
  const location = useLocation();

  return (
    <Flex
      justify="space-between"
      align="center"
      direction="row-reverse"
      className={classes.bar}
    >
      <LoginToolbar />
      {location.pathname !== "/" && <Search />}
    </Flex>
  );
};

export default NavigationBar;
