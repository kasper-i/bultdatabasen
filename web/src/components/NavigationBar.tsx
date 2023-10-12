import { FC, ReactElement } from "react";
import { useLocation } from "react-router-dom";
import LoginToolbar from "./LoginToolbar";
import Search from "./Search";
import classes from "./NavigationBar.module.css";
import { Flex } from "@mantine/core";
import clsx from "clsx";

const NavigationBar: FC<{ className?: string }> = ({
  className,
}): ReactElement => {
  const location = useLocation();

  return (
    <Flex
      justify="space-between"
      align="center"
      direction="row-reverse"
      className={clsx(classes.bar, className)}
    >
      <LoginToolbar />
      {location.pathname !== "/" && <Search />}
    </Flex>
  );
};

export default NavigationBar;
