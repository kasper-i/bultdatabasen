import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Button } from "semantic-ui-react";
import { Api } from "./Api";
import Signin from "./pages/Signin";

function App() {
  const gotoCognito = () => {
    const callback =
      window.location.protocol + "//" + window.location.host + "/signin";
    console.log(callback);

    window.location.href = `https://bultdatabasen.auth.eu-west-1.amazoncognito.com/login?client_id=4bc4eb6q54d9poodouksahhk86&response_type=code&scope=email+openid&redirect_uri=${callback}`;
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div style={{ minHeight: "50vh" }} className="flex flex-col bg-gray-900">
        <div className="absolute top-0 right-0 flex justify-end p-5">
          <Button primary size="medium" fluid={false} onClick={gotoCognito}>
            Logga In
          </Button>
        </div>
        <div className="flex flex-grow flex-col items-center justify-center text-white">
          <h1 className="text-5xl">Bultdatabasen</h1>
          <p className="italic text-lg">
            En databas över borrbultar, limbultar, ankare, etc.
          </p>
        </div>
      </div>

      <Router>
        <Switch>
          <Route path="/signin">
            <Signin />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
