import NavigationBar from "@/components/NavigationBar";
import React from "react";
import { Outlet } from "react-router-dom";

const Main = () => {
  return (
    <div className="w-screen min-h-screen flex flex-col">
      <NavigationBar />
      <div className="relative flex flex-grow">
        <div className="flex-grow mx-auto p-5" style={{ maxWidth: 768 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Main;
