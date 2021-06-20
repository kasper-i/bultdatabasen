import LoginToolbar from "components/LoginToolbar";
import Search from "components/Search";
import AreaPage from "pages/AreaPage";
import CragPage from "pages/CragPage";
import RoutePage from "pages/RoutePage";
import SectorPage from "pages/SectorPage";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Api } from "./Api";
import RootPage from "./pages/RootPage";
import SigninPage from "./pages/SigninPage";
import WelcomePage from "./pages/WelcomePage";

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-gray-100">
        <div className="bg-gray-900 h-16 shadow-md flex justify-between items-center px-2">
          <div className="flex items-center">
            <Search />
          </div>
          <LoginToolbar />
        </div>
        <div
          className="mx-auto flex flex-col mt-5 px-5"
          style={{ width: 1000 }}
        >
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
            <Route path="/crag/:cragId">
              <CragPage />
            </Route>
            <Route path="/sector/:sectorId">
              <SectorPage />
            </Route>
            <Route path="/route/:routeId">
              <RoutePage />
            </Route>
            <Route path="/signin">
              <SigninPage />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
