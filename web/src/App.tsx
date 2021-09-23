import NavBar from "components/NavBar";
import ResourceContent from "components/ResourceContent";
import { AuthContext } from "contexts/AuthContext";
import { SelectedResourceProvider } from "contexts/SelectedResourceProvider";
import { queryClient } from "index";
import SigninPage from "pages/SigninPage";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Dimmer, Loader } from "semantic-ui-react";
import { Api } from "./Api";

function App() {
  const [isAuthenticated, setAuthenticated] = useState(Api.authValid());
  const [initialized, setInitialized] = useState(false);

  const onFocus = () => {
    if (Api.isExpired()) {
      Api.refreshTokens();
      queryClient.refetchQueries({ active: true });
    }
  };

  useEffect(() => {
    window.addEventListener("focus", onFocus);

    if (Api.isExpired()) {
      Api.refreshTokens().finally(() => setInitialized(true));
    } else {
      setInitialized(true);
    }

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [setInitialized]);

  if (!initialized) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Dimmer active>
          <Loader />
        </Dimmer>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
      <Router>
        <div className="w-full min-h-screen flex flex-col">
          <NavBar />
          <div className="flex w-full flex-grow relative bg-gray-100">
            <div
              className="mx-auto p-5 flex flex-col w-full"
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
