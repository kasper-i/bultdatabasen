import React, { ReactElement } from "react";
import LoginToolbar from "./LoginToolbar";
import Search from "./Search";

const NavigationBar = (): ReactElement => {
  return (
    <div className="bg-gray-800 h-14 shadow-md flex justify-between items-center px-2 gap-4">
      <Search />
      <LoginToolbar />
    </div>
  );
};

export default NavigationBar;
