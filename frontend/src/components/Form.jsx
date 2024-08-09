import { useState } from "react";

export default function Form({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
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

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long`;
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return null; 
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8081/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        onLoginSuccess(result.token);
      } else {
        setResponseMessage(result.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Error in login", err);
      setResponseMessage("Network error, please try again later");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setResponseMessage(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setResponseMessage("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        onLoginSuccess(result.token);
      } else {
        setResponseMessage(result.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Error in user registration: ", err);
      setResponseMessage("Network error, please try again later");
    }
  };

  return (
    <>
      {hasAccount ? (
        <form onSubmit={handleLogin} className="grid gap-3">
          <label htmlFor="username">
            Username:
            <input
              type="text"
              name="username"
              id="username"
              onChange={handleChange}
              required
              className="border-2 border-red-500"
            />
          </label>
          <label htmlFor="password">
            Password:
            <input
              type="password"
              name="password"
              id="password"
              onChange={handleChange}
              required
              className="border-2 border-red-500"
            />
          </label>
          <button type="submit">Submit</button>
          <button type="button" onClick={() => setHasAccount(false)}>
            Make an account
          </button>
          {responseMessage && <p>{responseMessage}</p>}
        </form>
      ) : (
        <form onSubmit={handleRegister} className="grid gap-3">
          <label htmlFor="newUsername">
            Username:
            <input
              type="text"
              name="username"
              id="newUsername"
              onChange={handleChange}
              required
            />
          </label>
          <label htmlFor="newPassword">
            Password:
            <input
              type="password"
              name="password"
              id="newPassword"
              onChange={handleChange}
              required
            />
          </label>
          <label htmlFor="confirmNewPassword">
            Confirm Password:
            <input
              type="password"
              name="confirmPassword"
              id="confirmNewPassword"
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">Submit</button>
          <button type="button" onClick={() => setHasAccount(true)}>
            I have an account
          </button>
          {responseMessage && <p>{responseMessage}</p>}
        </form>
      )}
    </>
  );
}
