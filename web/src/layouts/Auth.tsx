import { Card } from "@/components/features/routeEditor/Card";
import { Outlet } from "react-router-dom";

const Auth = () => {
  return (
    <div className="w-full mt-20 flex justify-center items-center">
      <div className="w-full max-w-md">
        <Card>
          <Outlet />
        </Card>
      </div>
    </div>
  );
};

export default Auth;
