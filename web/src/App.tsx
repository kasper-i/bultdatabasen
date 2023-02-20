import SigninPage from "@/pages/SigninPage";
import React, { Suspense, useEffect, useState } from "react";
import "react-activity/dist/Digital.css";
import { useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Api } from "./Api";
import Loader from "./components/atoms/Loader";
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
import { ShowcasePage } from "./pages/ShowcasePage";
import { ErrorBoundary } from "./ErrorBoundary";
import RestorePasswordPage from "./pages/RestorePasswordPage";
import RegisterPage from "./pages/RegisterPage";
import Auth from "./layouts/Auth";
import { parseJwt } from "./utils/cognito";

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

      if (!Api.idToken) {
        return;
      }

      const {
        sub: userId,
        given_name: firstName,
        family_name: lastName,
      } = parseJwt(Api.idToken);
      dispatch(login({ userId, firstName, lastName }));
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
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Main />}>
            <Route path="/showcase" element={<ShowcasePage />} />
            <Route element={<Auth />}>
              <Route path="/auth/signin" element={<SigninPage />} />
              <Route
                path="/auth/forgot-password"
                element={<RestorePasswordPage />}
              />
              <Route path="/auth/register" element={<RegisterPage />} />
            </Route>
            <Route path="/signout" element={<SignoutPage />} />
            <Route
              path="/"
              element={
                <Suspense fallback={<Loader />}>
                  <RootPage />
                </Suspense>
              }
            />

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
    </ErrorBoundary>
  );
};

export default App;
