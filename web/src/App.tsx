import React from "react";
import { Button } from "semantic-ui-react";

function App() {
  const gotoCognito = () => {
    const callback =
      window.location.protocol + "//" + window.location.host + "/signin";
    console.log(callback);

    window.location.href = `https://bultdatabasen.auth.eu-west-1.amazoncognito.com/login?client_id=4bc4eb6q54d9poodouksahhk86&response_type=code&scope=email+openid&redirect_uri=${callback}`;
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-100">
      <div style={{ height: 600 }} className="bg-gray-900">
        <div className="flex justify-end p-5">
          <Button primary size="medium" fluid={false} onClick={gotoCognito}>
            Logga In
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl">Bultdatabasen</h1>
          <p className="italic text-lg">
            En databas över borrbultar, limbultar, ankare, etc.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
