import { useState } from "react";
import "./App.css";
import UserAuth from "./components/UserAuth";
import Layout from "./components/Layout";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  const handleLoginSuccess = (token) => {
    setToken(token);
    setIsLoggedIn(true);
  };

  return (
    <div>
      {!isLoggedIn ? <UserAuth onLoginSuccess={handleLoginSuccess} /> : <Layout />}
    </div>
  );
}

export default App;
