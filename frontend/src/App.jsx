import { useState } from "react";
import UserAuth from "./components/UserAuth";
import Layout from "./components/Layout";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null)

  const handleLoginSuccess = (username) => {
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
