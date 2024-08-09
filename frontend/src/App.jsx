import { useState } from "react";
import "./App.css";
import Form from "./components/Form";
import Layout from "./components/Layout";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  const handleLoginSuccess = (token) => {
    setToken(token);
    setIsLoggedIn(true);
  };

  return (
    <>
      {isLoggedIn ? <Layout /> : <Form onLoginSuccess={handleLoginSuccess} />}
    </>
  );
}

export default App;
