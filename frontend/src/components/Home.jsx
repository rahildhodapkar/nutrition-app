/**
 * Home Component - Main dashboard for the Nutron application
 * 
 * This component serves as the primary dashboard, displaying the user's
 * calorie consumption and weight over time, as well as providing a form
 * to add new weight entries.
 */

import { useEffect, useState, useCallback } from "react";
import { CaloriesOverTime, WeightOverTime } from "./Graphs";

// Access environment-specific API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Home({ username }) {
  // State management
  const [weight, setWeight] = useState("");
  const [weights, setWeights] = useState(null);
  const [calories, setCalories] = useState(null);
  const [isLoadingWeights, setIsLoadingWeights] = useState(true);
  const [isLoadingCalories, setIsLoadingCalories] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  // Fetch weight data from the API
  const fetchWeights = useCallback(async () => {
    setIsLoadingWeights(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/stats/getWeights?username=${encodeURIComponent(username)}`,
        { credentials: "include" }
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (Array.isArray(result)) {
        // Process data for visualization
        const weightStats = new Map(
          result.map((entry) => [new Date(entry.createdAt), entry.weight])
        );
        setWeights(weightStats);
      } else {
        setWeights(null);
      }
    } catch (err) {
      console.error("Error fetching weights:", err);
      setError("Failed to load weight data. Please try again later.");
      setWeights(null);
    } finally {
      setIsLoadingWeights(false);
    }
  }, [username]);

  // Fetch calorie data from the API
  const fetchCalories = useCallback(async () => {
    setIsLoadingCalories(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/usda/getAllFoods?username=${encodeURIComponent(username)}`,
        { credentials: "include" }
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (Array.isArray(result)) {
        // Process and group calorie data by date
        const groupedCalories = result.reduce((acc, food) => {
          const date = new Date(food.createdAt).toDateString();
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += food.calories || 0;
          return acc;
        }, {});

        // Convert to Map for visualization component
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
      setError("Failed to load calorie data. Please try again later.");
      setCalories(null);
    } finally {
      setIsLoadingCalories(false);
    }
  }, [username]);

  // Load data when component mounts
  useEffect(() => {
    fetchWeights();
    fetchCalories();
  }, [fetchWeights, fetchCalories]);

  // Handle weight form submission
  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!weight || isNaN(weight) || parseFloat(weight) <= 0) {
      setMessage("Please enter a valid weight greater than zero.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/stats/addWeight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, weight: parseFloat(weight) }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Success feedback and refresh data
      setMessage("Weight added successfully!");
      setWeight(""); // Clear the input field
      fetchWeights(); // Refresh the weight chart
    } catch (err) {
      console.error("Error adding weight:", err);
      setMessage("Error adding weight. Please try again.");
    }
  };

  // Calculate statistics
  const getWeightStats = () => {
    if (!weights || weights.size === 0) return null;
    
    const weightValues = Array.from(weights.values());
    const latestWeight = weightValues[weightValues.length - 1];
    const earliestWeight = weightValues[0];
    const weightDiff = latestWeight - earliestWeight;
    
    return {
      latest: latestWeight.toFixed(1),
      change: weightDiff.toFixed(1),
      trend: weightDiff > 0 ? "gained" : weightDiff < 0 ? "lost" : "maintained"
    };
  };

  const getCalorieStats = () => {
    if (!calories || calories.size === 0) return null;
    
    const values = Array.from(calories.values());
    return {
      average: (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(0),
      highest: Math.max(...values).toFixed(0),
      lowest: Math.min(...values).toFixed(0)
    };
  };

  const weightStats = getWeightStats();
  const calorieStats = getCalorieStats();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-center text-4xl font-bold mb-8">Dashboard</h1>
      
      {/* Welcome message with user stats */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Welcome back, {username}!</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {weightStats && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-orange-400">Weight Status</h3>
              <p className="mt-2">
                Your current weight is <span className="font-bold">{weightStats.latest} kg</span>.
                You've {weightStats.trend} <span className="font-bold">{Math.abs(weightStats.change)} kg</span> since you started tracking.
              </p>
            </div>
          )}
          
          {calorieStats && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-orange-400">Calorie Insights</h3>
              <p className="mt-2">
                Your daily average is <span className="font-bold">{calorieStats.average} kcal</span>.
                Your highest day was <span className="font-bold">{calorieStats.highest} kcal</span> and
                your lowest was <span className="font-bold">{calorieStats.lowest} kcal</span>.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error message display */}
      {error && (
        <div className="bg-red-500/30 border border-red-500 text-white p-4 rounded-lg mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button 
          onClick={() => document.getElementById("weight-form").scrollIntoView({ behavior: 'smooth' })}
          className="bg-gray-800 hover:bg-orange-500 transition-colors duration-300 p-4 rounded-xl flex flex-col items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Weight</span>
        </button>
        <button 
          onClick={() => window.location.href = "#/food"}
          className="bg-gray-800 hover:bg-orange-500 transition-colors duration-300 p-4 rounded-xl flex flex-col items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Log Food</span>
        </button>
        <button 
          onClick={() => window.location.href = "#/macros"}
          className="bg-gray-800 hover:bg-orange-500 transition-colors duration-300 p-4 rounded-xl flex flex-col items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Set Macros</span>
        </button>
        <button 
          onClick={() => window.location.href = "#/recipes"}
          className="bg-gray-800 hover:bg-orange-500 transition-colors duration-300 p-4 rounded-xl flex flex-col items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
          </svg>
          <span>Find Recipes</span>
        </button>
      </div>

      {/* Data visualization section */}
      <div className="flex flex-col lg:flex-row lg:gap-10 w-full mb-12">
        <div className="flex-1 bg-gray-800 p-6 rounded-xl shadow-lg mb-6 lg:mb-0">
          <h2 className="text-center font-semibold text-2xl mb-6 text-orange-400">Calories Over Time</h2>
          {isLoadingCalories ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
            </div>
          ) : calories && calories.size > 0 ? (
            <CaloriesOverTime stats={calories} />
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p>No calorie data available.</p>
              <p className="mt-2 text-sm">Start tracking your food intake to see data here.</p>
            </div>
          )}
        </div>
        
        <div className="flex-1 bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-center font-semibold text-2xl mb-6 text-orange-400">Weight Over Time</h2>
          {isLoadingWeights ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
            </div>
          ) : weights && weights.size > 0 ? (
            <WeightOverTime stats={weights} />
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p>No weight data available.</p>
              <p className="mt-2 text-sm">Add your weight below to start tracking.</p>
            </div>
          )}
        </div>
      </div>

      <div id="weight-form" className="bg-gray-800 rounded-xl p-6 shadow-lg max-w-md mx-auto mt-12">
        <h2 className="text-center font-semibold text-2xl mb-6 text-orange-400">Track Your Weight</h2>
        <form onSubmit={handleWeightSubmit} className="space-y-4">
          <div>
            <label htmlFor="weight-input" className="block text-sm font-medium mb-1">
              Current Weight (kg)
            </label>
            <div className="relative">
              <input
                id="weight-input"
                type="number"
                step="0.1"
                min="1"
                max="500"
                placeholder="Enter your weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="rounded-lg p-3 pr-12 text-black w-full focus:ring-2 focus:ring-orange-400 focus:outline-none"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">kg</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Record your weight to track changes over time</p>
          </div>
          
          <button
            type="submit"
            className="w-full bg-orange-400 hover:bg-orange-500 text-white font-medium py-3 rounded-lg transition duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          >
            Save Weight
          </button>
        </form>
        
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center text-sm ${message.includes("Error") ? "bg-red-500/20 text-red-100" : "bg-green-500/20 text-green-100"}`}>
            {message}
          </div>
        )}
      </div>
      
      <div className="text-center text-sm text-gray-400 mt-12 mb-8">
        <p>Consistently tracking your weight helps you monitor progress toward your health goals.</p>
        <p>For best results, weigh yourself at the same time each day, preferably in the morning.</p>
      </div>
    </div>
  );
}
