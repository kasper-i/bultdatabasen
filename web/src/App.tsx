import LoginToolbar from "components/LoginToolbar";
import AreaPage from "pages/AreaPage";
import RoutePage from "pages/RoutePage";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Button, Input } from "semantic-ui-react";
import { Api } from "./Api";
import RootPage from "./pages/RootPage";
import SigninPage from "./pages/SigninPage";
import WelcomePage from "./pages/WelcomePage";

function App() {
  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="bg-gray-900 h-16 shadow-md flex justify-between items-center px-2">
        <div className="flex items-center">
          <Input focus placeholder="Sök..." />
        </div>
        <LoginToolbar />
      </div>
      <div className="mx-auto flex flex-col mt-5" style={{ width: 1000 }}>
        <Router>
          <Switch>
            <Route
              exact
              path="/"
              component={() =>
                Api.authValid() ? <RootPage /> : <WelcomePage />
              }
            ></Route>
            <Route path="/area/:areaId">
              <AreaPage />
            </Route>
            <Route path="/crag/:resourceId"></Route>
            <Route path="/sector/:resourceId"></Route>
            <Route path="/route/:routeId">
              <RoutePage />
            </Route>
            <Route path="/signin">
              <SigninPage />
            </Route>
          </Switch>
        </Router>
      </div>
    </div>
  );
}

export default App;
