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
              <p className="mt-2 text-sm">Add your weight
