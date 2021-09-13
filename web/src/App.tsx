import CreateTask from "components/CreateTask";
import LoginToolbar from "components/LoginToolbar";
import Search from "components/Search";
import SidePanel from "components/SidePanel";
import TaskList from "components/TaskList";
import { AuthContext } from "contexts/AuthContext";
import AreaPage from "pages/AreaPage";
import CragPage from "pages/CragPage";
import RoutePage from "pages/RoutePage";
import SectorPage from "pages/SectorPage";
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Api } from "./Api";
import RootPage from "./pages/RootPage";
import SigninPage from "./pages/SigninPage";
import WelcomePage from "./pages/WelcomePage";

function App() {
  const [isAuthenticated, setAuthenticated] = useState(Api.authValid());

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
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
            style={{ maxWidth: 768 }}
          >
            <Switch>
              <Route
                exact
                path="/"
                component={() =>
                  isAuthenticated ? <RootPage /> : <WelcomePage />
                }
              ></Route>
              <Route path="/area/:resourceId">
                <AreaPage />
              </Route>
              <Route path="/crag/:resourceId">
                <CragPage />
              </Route>
              <Route path="/sector/:resourceId">
                <SectorPage />
              </Route>
              <Route path="/route/:resourceId">
                <RoutePage />
              </Route>
              <Route path="/signin">
                <SigninPage />
              </Route>
            </Switch>

            <Route path="/(area|crag|sector|route)/:resourceId">
              <SidePanel>
                <TaskList />
                <Route path="/route/:resourceId">
                  <CreateTask />
                </Route>
              </SidePanel>
            </Route>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
