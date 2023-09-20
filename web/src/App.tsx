import SigninPage from "@/pages/SigninPage";
import { useQueryClient } from "@tanstack/react-query";
import { CognitoUserSession } from "amazon-cognito-identity-js";
import { Suspense, useEffect, useState } from "react";
import "react-activity/dist/Digital.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Api } from "./Api";
import Loader from "./components/atoms/Loader";
import { ErrorBoundary } from "./ErrorBoundary";
import Auth from "./layouts/Auth";
import Main from "./layouts/Main";
import Page from "./layouts/Page";
import AreaPage from "./pages/AreaPage";
import CragPage from "./pages/CragPage";
import RegisterPage from "./pages/RegisterPage";
import RestorePasswordPage from "./pages/RestorePasswordPage";
import RootPage from "./pages/RootPage";
import RoutePage from "./pages/RoutePage";
import SectorPage from "./pages/SectorPage";
import SignoutPage from "./pages/SignoutPage";
import TasksPage from "./pages/TasksPage";
import { login } from "./slices/authSlice";
import { useAppDispatch } from "./store";
import { getCurrentUser, refreshSession } from "./utils/cognito";
import configData from "@/config.json";
import { NewRoutePage } from "./pages/NewRoutePage";
import { EditRoutePage } from "./pages/EditRoutePage";

const App = () => {
  const dispatch = useAppDispatch();
  const [initialized, setInitialized] = useState(false);

  const queryClient = useQueryClient();

  const onFocus = async () => {
    try {
      const accessToken = await refreshSession();

      if (accessToken) {
        Api.setAccessToken(accessToken);
      }

      if (import.meta.env.PROD) {
        queryClient.refetchQueries({ type: "active" });
      }
      // eslint-disable-next-line no-empty
    } catch {}
  };

  useEffect(() => {
    window.addEventListener("focus", onFocus);

    const initialize = async () => {
      const cognitoUser = getCurrentUser();

      if (cognitoUser) {
        cognitoUser.getSession((err: null, session: CognitoUserSession) => {
          if (err) {
            return;
          }

          const idToken = session.getIdToken();
          const accessToken = session.getAccessToken();

          Api.setAccessToken(accessToken.getJwtToken());

          const {
            sub: userId,
            email,
            given_name: firstName,
            family_name: lastName,
          } = idToken.decodePayload();

          dispatch(login({ userId, email, firstName, lastName }));
        });
      }
    };

    initialize().finally(() => setInitialized(true));

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [setInitialized]);

  if (
    import.meta.env.DEV &&
    configData.API_URL === "https://api.bultdatabasen.se"
  ) {
    return (
      <pre className="text-red-500 h-screen w-screen flex justify-center items-center">
        Production environment is blocked in DEV mode!
      </pre>
    );
  }

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
            <Route element={<Auth />}>
              <Route path="/auth/signin" element={<SigninPage />} />
              <Route
                path="/auth/forgot-password"
                element={<RestorePasswordPage />}
              />
              <Route path="/auth/register" element={<RegisterPage />} />
            </Route>
            <Route path="/auth/signout" element={<SignoutPage />} />
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
              <Route path="new-route" element={<NewRoutePage />} />
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
              <Route path="edit" element={<EditRoutePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
