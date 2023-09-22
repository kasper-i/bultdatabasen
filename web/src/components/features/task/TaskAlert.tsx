import { IconTools } from "@tabler/icons-react";
import { FC } from "react";
import { Link } from "react-router-dom";

export const TaskAlert: FC<{ openTasks: number }> = ({ openTasks }) => {
  return (
    <div className="mt-5 flex gap-1 items-center border-l-4 border-primary-500 px-2">
      <IconTools size={14} />
      <span className="font-bold">{openTasks}</span>
      {openTasks === 1 ? "ohanterat" : "ohanterade"} problem
      <Link
        to="tasks"
        className="flex-grow text-right text-primary-500 font-bold"
      >
        <span>Visa</span>
      </Link>
    </div>
  );
};
