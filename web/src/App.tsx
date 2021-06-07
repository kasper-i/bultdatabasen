import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Api } from "./Api";
import RootPage from "./pages/RootPage";
import SigninPage from "./pages/SigninPage";
import WelcomePage from "./pages/WelcomePage";

function App() {
  const renderHelper = () => {
    if (Api.authValid()) {
      return (
        <Switch>
          <Route path="/">
            <RootPage />
          </Route>
          <Route path="/area/:resourceId">
            <RootPage />
          </Route>
        </Switch>
      );
    } else {
      return (
        <Switch>
          <Route path="/signin">
            <SigninPage />
          </Route>
          <Route path="/">
            <WelcomePage />
          </Route>
        </Switch>
      );
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div style={{ minHeight: "50vh" }} className="flex flex-col bg-gray-900">
        <Router>{renderHelper()}</Router>
      </div>
    </div>
  );
}

export default App;
