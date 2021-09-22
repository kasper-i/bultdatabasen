import { RoleContext } from "contexts/RoleContext";
import { useSelectedResource } from "contexts/SelectedResourceProvider";
import AreaPage from "pages/AreaPage";
import CragPage from "pages/CragPage";
import RootPage from "pages/RootPage";
import RoutePage from "pages/RoutePage";
import SectorPage from "pages/SectorPage";
import { useRole } from "queries/roleQueries";
import React, { useState } from "react";
import { Route, Switch } from "react-router-dom";
import TaskIcon from "./features/task/TaskIcon";
import TaskPanel from "./features/task/TaskPanel";

const ResourceContent = () => {
  const [showTasks, setShowTasks] = useState(false);

  const { selectedResource } = useSelectedResource();

  const { role } = useRole(selectedResource.id);

  return (
    <RoleContext.Provider value={{ role }}>
      <div className="absolute top-0 right-0 p-5">
        <TaskIcon onClick={() => setShowTasks(true)} />
      </div>
      <Switch>
        <Route exact path="/">
          <RootPage />
        </Route>
        <Route path="/area/:resourceId">
          <AreaPage />
        </Route>
        <Route path="/crag/:resourceId">
          <CragPage />
        </Route>
        <Route path="/sector/:resourceId">
          <SectorPage />
        </Route>
        <Route path="/route/:resourceId/(point)?/:pointId?">
          <RoutePage />
        </Route>
      </Switch>
      {showTasks && <TaskPanel onClose={() => setShowTasks(false)} />}
    </RoleContext.Provider>
  );
};

export default ResourceContent;
