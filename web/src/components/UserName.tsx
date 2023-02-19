import { useUsers } from "@/queries/userQueries";
import React, { FC } from "react";

const UserName: FC<{ userId: string }> = ({ userId }) => {
  const { data: users } = useUsers();

  const userInfo = users?.get(userId);

  return (
    <span className="text-primary-500">
      {`${userInfo?.firstName} ${userInfo?.lastName?.[0]}`}
    </span>
  );
};

export default UserName;
