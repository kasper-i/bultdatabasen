import SigninPage from "@/pages/SigninPage";
import React, { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Dimmer, Loader } from "semantic-ui-react";
import { Api } from "./Api";
import Main from "./layouts/Main";
import Page from "./layouts/Page";
import AreaPage from "./pages/AreaPage";
import CragPage from "./pages/CragPage";
import RootPage from "./pages/RootPage";
import RoutePage from "./pages/RoutePage";
import SectorPage from "./pages/SectorPage";
import TasksPage from "./pages/TasksPage";

const App = () => {
  const [initialized, setInitialized] = useState(false);

  const queryClient = useQueryClient();

  const onFocus = () => {
    if (Api.isExpired()) {
      Api.refreshTokens();
      queryClient.refetchQueries({ active: true });
    }
  };

  useEffect(() => {
    window.addEventListener("focus", onFocus);

    if (Api.isExpired()) {
      Api.refreshTokens().finally(() => setInitialized(true));
    } else {
      setInitialized(true);
    }

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [setInitialized]);

  if (!initialized) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Dimmer active>
          <Loader />
        </Dimmer>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Main />}>
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/" element={<RootPage />} />

          <Route path="area/:resourceId" element={<Page />}>
            <Route index element={<AreaPage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
          <Route path="crag/:resourceId" element={<Page />}>
            <Route index element={<CragPage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
          <Route path="sector/:resourceId" element={<Page />}>
            <Route index element={<SectorPage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
          <Route path="route/:resourceId" element={<Page />}>
            <Route index element={<RoutePage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
