import { useState } from "react";
import mp4Video from "../assets/bg-vid.mp4";
import webmVideo from "../assets/bg-vid.webm";

export default function UserAuth({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [responseMessage, setResponseMessage] = useState("");
  const [hasAccount, setHasAccount] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        onLoginSuccess(result.user.username);
      } else {
        const result = await response.json();
        setResponseMessage(result.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Error in login", err);
      setResponseMessage("Network error, please try again later");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setResponseMessage("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setResponseMessage("Registration successful! Please log in.");
        setHasAccount(true);
      } else {
        const result = await response.json();
        setResponseMessage(result.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Error in registration", err);
      setResponseMessage("Network error, please try again later");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <video
        autoPlay
        muted
        loop
        className="fixed top-0 left-0 right-0 bottom-0 w-full h-full object-cover"
      >
        <source src={webmVideo} type="video/webm" />
        <source src={mp4Video} type="video/mp4" />
      </video>
      <div className="background fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-black/30"></div>
      <h1 className="z-10 font-semibold text-7xl sm:text-9xl text-center mt-16 mb-4">Nutron</h1>
      <h2 className="z-10 font-normal text-sm sm:text-2xl text-center mb-10">Join today to make your nutrition struggles a thing of the past</h2>
      <div className="z-10 auth-container m-4 backdrop-blur-lg bg-zinc-300/30 rounded-xl sm:w-1/2 lg:w-1/4">
        {hasAccount ? (
          <form onSubmit={handleLogin} className="grid gap-3 p-10 place-items-center">
            <label className="grid place-items-center" htmlFor="username">
              Username
              <input
                type="text"
                name="username"
                id="username"
                onChange={handleChange}
                className="rounded-lg p-2"
                required
              />
            </label>
            <label className="grid place-items-center" htmlFor="password">
              Password
              <input
                type="password"
                name="password"
                id="password"
                onChange={handleChange}
                className="rounded-lg p-2"
                required
              />
            </label>
            <button type="submit" className="border-orange-400 border-2 p-2 w-full rounded-lg hover:bg-orange-400 transition duration-300 ease-out">Submit</button>
            <button type="button" className="border-orange-400 border-2 p-2 w-full rounded-lg hover:bg-orange-400 transition duration-300 ease-out" onClick={() => setHasAccount(false)}>
              Make an account
            </button>
            {responseMessage && <p>{responseMessage}</p>}
          </form>
        ) : (
          <form onSubmit={handleRegister} className="grid gap-3 p-10">
            <label className="grid place-items-center" htmlFor="newUsername">
              Username
              <input
                type="text"
                name="username"
                id="newUsername"
                onChange={handleChange}
                className="rounded-lg p-2"
                required
              />
            </label>
            <label className="grid place-items-center" htmlFor="newPassword">
              Password
              <input
                type="password"
                name="password"
                id="newPassword"
                onChange={handleChange}
                className="rounded-lg p-2"
                required
              />
            </label>
            <label className="grid place-items-center" htmlFor="confirmNewPassword">
              Confirm Password
              <input
                type="password"
                name="confirmPassword"
                id="confirmNewPassword"
                onChange={handleChange}
                className="rounded-lg p-2"
                required
              />
            </label>
            <button type="submit" className="border-orange-400 border-2 p-2 w-full rounded-lg hover:bg-orange-400 transition duration-300 ease-out">Submit</button>
            <button type="button" className="border-orange-400 border-2 p-2 w-full rounded-lg hover:bg-orange-400 transition duration-300 ease-out" onClick={() => setHasAccount(true)}>
              I have an account
            </button>
            {responseMessage && <p>{responseMessage}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
