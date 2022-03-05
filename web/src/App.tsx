import NavigationBar from "@/components/NavigationBar";
import ResourceContent from "@/components/ResourceContent";
import { SelectedResourceProvider } from "@/contexts/SelectedResourceProvider";
import { queryClient } from "@/index";
import SigninPage from "@/pages/SigninPage";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Dimmer, Loader } from "semantic-ui-react";
import { Api } from "./Api";

function App() {
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
    <div className="w-screen min-h-screen bg-gray-100">
      <Router>
        <NavigationBar />
        <div className="relative">
          <div className="mx-auto p-5" style={{ maxWidth: 768 }}>
            <Route path="/signin" element={<SigninPage />} />
            <Route path="/">
              <SelectedResourceProvider>
                <ResourceContent />
              </SelectedResourceProvider>
            </Route>
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;
