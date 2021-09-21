import NavBar from "components/NavBar";
import ResourceContent from "components/ResourceContent";
import { AuthContext } from "contexts/AuthContext";
import { SelectedResourceProvider } from "contexts/SelectedResourceProvider";
import SigninPage from "pages/SigninPage";
import React, { useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Api } from "./Api";

function App() {
  const [isAuthenticated, setAuthenticated] = useState(Api.authValid());

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
      <Router>
        <div className="w-full min-h-screen flex flex-col">
          <NavBar />
          <div className="flex w-full flex-grow relative bg-gray-100">
            <div
              className="mx-auto p-5 flex flex-col"
              style={{ maxWidth: 768 }}
            >
              <Route path="/signin">
                <SigninPage />
              </Route>
              <Route path="/">
                <SelectedResourceProvider>
                  <ResourceContent />
                </SelectedResourceProvider>
              </Route>
            </div>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
