import NavigationBar from "@/components/NavigationBar";
import React from "react";
import { Outlet } from "react-router-dom";

const Main = () => {
  return (
    <div className="w-screen min-h-screen flex flex-col">
      <div className="bg-red-500 h-8 flex justify-center items-center text-white">
        <div>Allt innehåll på sidan består av testdata!</div>
      </div>
      <NavigationBar />
      <div className="relative flex-grow">
        <div className="mx-auto p-5" style={{ maxWidth: 768 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Main;
