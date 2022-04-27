import SigninPage from "@/pages/SigninPage";
import React, { Suspense, useEffect, useState } from "react";
import "react-activity/dist/Digital.css";
import { useQueryClient } from "react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Api } from "./Api";
import Loader from "./components/atoms/Loader";
import Spinner from "./components/atoms/Spinner";
import Main from "./layouts/Main";
import Page from "./layouts/Page";
import AreaPage from "./pages/AreaPage";
import CragPage from "./pages/CragPage";
import RootPage from "./pages/RootPage";
import RoutePage from "./pages/RoutePage";
import SectorPage from "./pages/SectorPage";
import SignoutPage from "./pages/SignoutPage";
import TasksPage from "./pages/TasksPage";
import { login } from "./slices/authSlice";
import { useAppDispatch } from "./store";

const App = () => {
  const dispatch = useAppDispatch();
  const [initialized, setInitialized] = useState(false);

  const queryClient = useQueryClient();

  const onFocus = () => {
    if (Api.isExpired()) {
      Api.refreshTokens();
      queryClient.refetchQueries({ type: "active" });
    }
  };

  useEffect(() => {
    window.addEventListener("focus", onFocus);

    const initialize = async () => {
      if (!Api.authValid()) {
        return;
      }

      if (Api.isExpired()) {
        await Api.refreshTokens();
      }

      const info = await Api.getMyself();
      dispatch(login({ firstName: info.firstName, lastName: info.lastName }));
    };

    initialize().finally(() => setInitialized(true));

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [setInitialized]);

  if (!initialized) {
    return (
      <div className="w-screen h-screen bg-gray-900 text-gray-400">
        <Loader />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Main />}>
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/signout" element={<SignoutPage />} />
          <Route path="/" element={<RootPage />} />

          <Route
            path="area/:resourceId"
            element={
              <Suspense fallback={<Loader />}>
                <Page />
              </Suspense>
            }
          >
            <Route index element={<AreaPage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
          <Route
            path="crag/:resourceId"
            element={
              <Suspense fallback={<Loader />}>
                <Page />
              </Suspense>
            }
          >
            <Route index element={<CragPage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
          <Route
            path="sector/:resourceId"
            element={
              <Suspense fallback={<Loader />}>
                <Page />
              </Suspense>
            }
          >
            <Route index element={<SectorPage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
          <Route
            path="route/:resourceId"
            element={
              <Suspense fallback={<Loader />}>
                <Page />
              </Suspense>
            }
          >
            <Route index element={<RoutePage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
