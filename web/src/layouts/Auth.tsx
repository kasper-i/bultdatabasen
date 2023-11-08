import { Card, Center } from "@mantine/core";
import { Outlet } from "react-router-dom";
import classes from "./Auth.module.css";

const Auth = () => {
  return (
    <Center className={classes.container}>
      <Card withBorder className={classes.card}>
        <Outlet />
      </Card>
    </Center>
  );
};

export default Auth;
