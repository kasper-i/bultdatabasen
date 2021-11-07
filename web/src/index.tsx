import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import {
  Provider,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import "semantic-ui-css/semantic.min.css";
import authReducer from "@/slices/authSlice";
import clipboardReducer from "@/slices/clipboardSlice";
import { Api } from "./Api";
import App from "./App";
import "./index.css";

Api.restoreTokens();

const refreshAuthLogic = async (failedRequest?: any) => {
  await Api.refreshTokens();

  failedRequest.response.config.headers["Authorization"] =
    "Bearer " + Api.accessToken;
};

createAuthRefreshInterceptor(axios, refreshAuthLogic);

export const queryClient = new QueryClient();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clipboard: clipboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </Provider>
  </QueryClientProvider>,
  document.getElementById("root")
);
