import { useEffect, useState } from "react";
import { CaloriesOverTime, WeightOverTime } from "./Graphs";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
        `${API_BASE_URL}/stats/getWeights?username=${username}`,
        { credentials: "include" }
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
        `${API_BASE_URL}/usda/getAllFoods?username=${username}`,
        { credentials: "include" }
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
          Object.entries(groupedCalories).map(([date, calories]) => [
            new Date(date),
            calories,
          ])
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
      const response = await fetch(`${API_BASE_URL}/stats/addWeight`, {
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
    <div className="grid place-items-center p-7">
      <h1 className="text-center text-4xl mt-8">Home</h1>
      <span className="m-4">Welcome back, {username}!</span>

      <div className="flex flex-col lg:flex-row lg:gap-10 w-full">
        <div className="flex-1 grid place-items-center">
          <h2 className="text-center p-3 text-2xl">Calories Over Time</h2>
          {isLoadingCalories ? (
            <p>Loading...</p>
          ) : calories ? (
            <CaloriesOverTime stats={calories} />
          ) : (
            <p>No calorie data available.</p>
          )}
        </div>
        <div className="flex-1 grid place-items-center">
          <h2 className="text-center p-3 text-2xl">Weight Over Time</h2>
          {isLoadingWeights ? (
            <p>Loading...</p>
          ) : weights ? (
            <WeightOverTime stats={weights} />
          ) : (
            <p>No weight data available.</p>
          )}
        </div>
      </div>

      <div className="grid place-items-center mt-10 w-1/2 lg:w-96">
        <h2 className="text-center p-3 text-2xl">Add a New Bodyweight</h2>
        <form onSubmit={handleWeightSubmit} className="grid place-items-center gap-3 w-full">
          <input
            type="number"
            placeholder="Enter weight in kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="rounded-xl p-2 text-black w-full"
            required
          />
          <button
            type="submit"
            className="border-orange-400 border-2 p-2 rounded-xl w-28 hover:bg-orange-400 transition duration-300 ease-out"
          >
            Add Weight
          </button>
        </form>
        {message && <p style={{ fontSize: ".7rem" }} className="pt-4">{message}</p>}
      </div>
    </div>
  );
}
