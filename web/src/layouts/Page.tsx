import TaskButton from "@/components/features/task/TaskButton";
import React from "react";
import { Link, Outlet } from "react-router-dom";

const Page = () => {
  return (
    <div>
      <div className="absolute top-0 right-0 p-5">
        <Link to="tasks">
          <TaskButton />
        </Link>
      </div>
      <Outlet />
    </div>
  );
};

export default Page;
