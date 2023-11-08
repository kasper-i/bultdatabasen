import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/spotlight/styles.css";
import { init } from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ZodError } from "zod";
import { Api } from "./Api";
import App from "./App";
import { store } from "./store";
import { refreshSession } from "./utils/cognito";

if (!import.meta.env.DEV) {
  init({
    dsn: "https://04d52d3586ee4b5d97e09ceb7a0b906e@o4504061877157888.ingest.sentry.io/4504079496708096",
    integrations: [],
    release: "bultdatabasen@" + __APP_VERSION__,
    beforeBreadcrumb(breadcrumb, hint) {
      if (hint && breadcrumb.category === "ui.click") {
        const { target } = hint.event;
        if (target.ariaLabel) {
          breadcrumb.message = target.ariaLabel;
        }
      }
      return breadcrumb;
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const refreshAuthLogic = async (failedRequest?: any) => {
  const accessToken = await refreshSession(true);
  if (accessToken) {
    Api.setAccessToken(accessToken);
  }

  failedRequest.response.config.headers["Authorization"] =
    "Bearer " + accessToken;
};

createAuthRefreshInterceptor(axios, refreshAuthLogic);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      suspense: true,
      retry: (_, error) => !(error instanceof ZodError),
    },
  },
});

const container = document.getElementById("root");

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

const theme = createTheme({
  colors: {
    brand: [
      "#f7ebff",
      "#e6d3fe",
      "#c8a4f7",
      "#aa74f1",
      "#9049eb",
      "#802ee8",
      "#7820e8",
      "#6614cf",
      "#5a10ba",
      "#4d08a4",
    ],
  },
  primaryColor: "brand",
});

root.render(
  <MantineProvider theme={theme}>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
      </Provider>
    </QueryClientProvider>
  </MantineProvider>
);
