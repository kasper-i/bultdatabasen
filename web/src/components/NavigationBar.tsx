import React, { ReactElement } from "react";
import { useLocation } from "react-router-dom";
import LoginToolbar from "./LoginToolbar";
import Search from "./Search";

const NavigationBar = (): ReactElement => {
  const location = useLocation();

  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-300 h-14 shadow-md flex justify-between items-center px-5 gap-4">
      <div className="max-w-xs">{location.pathname !== "/" && <Search />}</div>
      <LoginToolbar />
    </div>
  );
};

export default NavigationBar;
