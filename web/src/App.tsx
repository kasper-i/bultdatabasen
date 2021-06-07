import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Api } from "./Api";
import RootPage from "./pages/RootPage";
import SigninPage from "./pages/SigninPage";
import WelcomePage from "./pages/WelcomePage";

function App() {
  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div style={{ minHeight: "50vh" }} className="flex flex-col bg-gray-900">
        <Router>
          <Switch>
            <Route
              exact
              path="/"
              component={() =>
                Api.authValid() ? <RootPage /> : <WelcomePage />
              }
            ></Route>
            <Route path="/area/:resourceId"></Route>
            <Route path="/crag/:resourceId"></Route>
            <Route path="/sector/:resourceId"></Route>
            <Route path="/route/:resourceId"></Route>
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
