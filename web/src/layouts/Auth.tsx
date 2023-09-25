import { Card } from "@/components/features/routeEditor/Card";
import { Outlet } from "react-router-dom";

const Auth = () => {
  return (
    <div data-tailwind="w-full mt-20 flex justify-center items-center">
      <div data-tailwind="w-full max-w-md">
        <Card>
          <Outlet />
        </Card>
      </div>
    </div>
  );
};

export default Auth;
