import { User } from "@/models/user";
import { FC } from "react";

const UserName: FC<{ user: User }> = ({ user }) => {
  return (
    <span className="text-primary-500">
      {`${user?.firstName} ${user?.lastName?.[0]}`}
    </span>
  );
};

export default UserName;
