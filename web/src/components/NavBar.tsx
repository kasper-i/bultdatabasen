import React, { ReactElement } from "react";
import LoginToolbar from "./LoginToolbar";
import Search from "./Search";

const NavBar = (): ReactElement => {
  return (
    <div className="bg-gray-900 h-16 shadow-md flex justify-between items-center px-2">
      <Search />
      <LoginToolbar />
    </div>
  );
};

export default NavBar;
