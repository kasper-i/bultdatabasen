import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Api } from "./Api";
import App from "./App";
import "./index.css";
import { store } from "./store";

if (!import.meta.env.DEV) {
  Sentry.init({
    dsn: "https://5e59e1b81cb3444d92f168fdae96f803@o4504061877157888.ingest.sentry.io/4504061898522624",
    integrations: [],
    release: "bultdatabasen@" + __APP_VERSION__,
  });
}

Api.restoreTokens();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const refreshAuthLogic = async (failedRequest?: any) => {
  await Api.refreshTokens();

  failedRequest.response.config.headers["Authorization"] =
    "Bearer " + Api.accessToken;
};

createAuthRefreshInterceptor(axios, refreshAuthLogic);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: !import.meta.env.DEV,
      suspense: true,
    },
  },
});

const container = document.getElementById("root");

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
    </Provider>
  </QueryClientProvider>
);
