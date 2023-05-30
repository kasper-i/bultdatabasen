import Button from "@/components/atoms/Button";
import PointEditor from "@/components/features/routeEditor/PointEditor";
import TaskButton from "@/components/features/task/TaskButton";
import PageHeader from "@/components/PageHeader";
import { Underlined } from "@/components/Underlined";
import { useUnsafeParams } from "@/hooks/common";
import { RouteType } from "@/models/route";
import { usePoints } from "@/queries/pointQueries";
import { useRoute } from "@/queries/routeQueries";
import { Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";

export const renderRouteType = (routeType: RouteType) => {
  switch (routeType) {
    case "sport":
      return "Sportled";
    case "traditional":
      return "Tradled";
    case "partially_bolted":
      return "Mixled";
    case "top_rope":
      return "Topprepsled";
    case "aid":
      return "Aidled";
    case "dws":
      return "Djupvattensolo";
  }
};

const RoutePage = () => {
  const { resourceId } = useUnsafeParams<"resourceId">();
  const naviate = useNavigate();

  const { data: route } = useRoute(resourceId);
  const { data: points } = usePoints(resourceId);

  if (route === undefined || points === undefined) {
    return <Fragment />;
  }

  const { routeType, year, length } = route;
  const parentId = route.ancestors?.slice(-1)[0]?.id;

  const numInstalledBolts = route?.counters?.installedBolts ?? 0;

  if (!parentId) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <div className="absolute top-0 right-0 p-5">
        <Link to="tasks">
          <TaskButton resourceId={resourceId} />
        </Link>
      </div>
      <PageHeader resourceId={resourceId} ancestors={route.ancestors} />

      <Button onClick={() => naviate("edit")}>Redigera</Button>

      <div className="flex items-center gap-2">
        <p className="text-md">
          <Underlined>{renderRouteType(routeType)}</Underlined>
          {year && (
            <>
              {" "}
              från <Underlined>{year}</Underlined>
            </>
          )}
          {" som "}
          {length && (
            <>
              {" "}
              är <Underlined>{length}m</Underlined> lång och{" "}
            </>
          )}
          har <Underlined>{numInstalledBolts}</Underlined> dokumenterade bult
          {numInstalledBolts !== 1 && "ar"}.
        </p>
      </div>

      <div className="mt-5">
        <PointEditor
          routeId={resourceId}
          routeParentId={parentId}
          points={points}
        />
      </div>
    </div>
  );
};

export default RoutePage;
