import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Provider } from "react-redux";
import { Api } from "./Api";
import App from "./App";
import "./index.css";
import { store } from "./store";

Api.restoreTokens();

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
    },
  },
});

const container = document.getElementById("root");

if (container !== null) {
  const root = createRoot(container);

  root.render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </Provider>
    </QueryClientProvider>
  );
}
