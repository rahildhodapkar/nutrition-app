import { useState } from "react";
import "./App.css";
import UserAuth from "./components/UserAuth";
import Layout from "./components/Layout";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null)

  const handleLoginSuccess = (token, username) => {
    setToken(token);
    setUsername(username);
    setIsLoggedIn(true);
  };

  return (
    <div>
      {!isLoggedIn ? <UserAuth onLoginSuccess={handleLoginSuccess} /> : <Layout username={username}/>}
    </div>
  );
}

export default App;
