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
        <Router>
          <Switch>
            <Route exact path="/signin">
              <SigninPage />
            </Route>
            <Route path="/">
              <RootPage />
            </Route>
          </Switch>
        </Router>
      );
    } else {
      return <WelcomePage />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div style={{ minHeight: "50vh" }} className="flex flex-col bg-gray-900">
        {renderHelper()}
      </div>
    </div>
  );
}

export default App;
