import { useUserNames } from "@/queries/userQueries";
import React, { FC } from "react";

const UserName: FC<{ userId: string }> = ({ userId }) => {
  const { data: userNames } = useUserNames();

  const userInfo = userNames?.get(userId);

  return (
    <span className="text-primary-500">
      {`${userInfo?.firstName} ${userInfo?.lastName?.[0]}`}
    </span>
  );
};

export default UserName;
