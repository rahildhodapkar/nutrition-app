import { useEffect, useState } from "react";
import { CaloriesOverTime, WeightOverTime } from "./Graphs";  

export default function Home({ username }) {
  const [weight, setWeight] = useState("");
  const [weights, setWeights] = useState(null);
  const [calories, setCalories] = useState(null);
  const [isLoadingWeights, setIsLoadingWeights] = useState(true);
  const [isLoadingCalories, setIsLoadingCalories] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchWeights();
    fetchCalories();
  }, []);

  const fetchWeights = async () => {
    setIsLoadingWeights(true);
    try {
      const response = await fetch(
        `http://localhost:8081/stats/getWeights?username=${username}`, {credentials: "include"}
      );
      const result = await response.json();
      if (response.ok && Array.isArray(result)) {
        const weightStats = new Map(
          result.map((entry) => [new Date(entry.createdAt), entry.weight])
        );
        setWeights(weightStats);
      } else {
        setWeights(null);
      }
    } catch (err) {
      console.error("Error fetching weights:", err);
      setWeights(null);
    } finally {
      setIsLoadingWeights(false);
    }
  };

  const fetchCalories = async () => {
    setIsLoadingCalories(true);
    try {
      const response = await fetch(
        `http://localhost:8081/usda/getAllFoods?username=${username}`, {credentials: "include"}
      );
      const result = await response.json();
      if (response.ok && Array.isArray(result)) {
        const groupedCalories = result.reduce((acc, food) => {
          const date = new Date(food.createdAt).toDateString();
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += food.calories || 0;
          return acc;
        }, {});

        const calorieStats = new Map(
          Object.entries(groupedCalories).map(([date, calories]) => [new Date(date), calories])
        );

        setCalories(calorieStats);
      } else {
        setCalories(null);
      }
    } catch (err) {
      console.error("Error fetching calories:", err);
      setCalories(null);
    } finally {
      setIsLoadingCalories(false);
    }
  };

  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    if (!weight || isNaN(weight)) {
      setMessage("Please enter a valid weight.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/stats/addWeight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, weight: parseFloat(weight) }),
      });

      if (response.ok) {
        setMessage("Weight added successfully.");
        fetchWeights(); 
      } else {
        setMessage("Error adding weight. Please try again.");
      }
    } catch (err) {
      console.error("Error adding weight:", err);
      setMessage("Error adding weight. Please try again.");
    }
  };

  return (
    <div>
      <h1>Home</h1>

      <div>
        <h2>Add a New Weight</h2>
        <form onSubmit={handleWeightSubmit}>
          <input
            type="number"
            placeholder="Enter weight in kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
          <button type="submit">Add Weight</button>
        </form>
        {message && <p>{message}</p>}
      </div>

      <div>
        <h2>Calories Over Time</h2>
        {isLoadingCalories ? (
          <p>Loading...</p>
        ) : calories ? (
          <CaloriesOverTime stats={calories} />
        ) : (
          <p>No calorie data available.</p>
        )}
      </div>

      <div>
        <h2>Weight Over Time</h2>
        {isLoadingWeights ? (
          <p>Loading...</p>
        ) : weights ? (
          <WeightOverTime stats={weights} />
        ) : (
          <p>No weight data available.</p>
        )}
      </div>
    </div>
  );
}
