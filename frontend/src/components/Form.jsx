import { useState } from "react";

export default function Form({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
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
        console.log(result.token)
        onLoginSuccess(result.token)
      } else {
        setResponseMessage(result.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Error in login", err);
      setResponseMessage("Network error, please try again later");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
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
      {responseMessage && <p>{responseMessage}</p>}
    </form>
  );
}
