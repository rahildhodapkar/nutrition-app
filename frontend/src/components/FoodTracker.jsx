/**
 * FoodTracker Component
 * 
 * A comprehensive food tracking interface that allows users to:
 * - Search for foods using the USDA database
 * - View their food log for specific dates
 * - Track daily macro consumption against goals
 * - Add new foods to their log
 */

import { useCallback, useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import FoodCard from "./FoodCard";
import { CaloriesLeft, ProteinLeft, FatLeft, CarbsLeft } from "./Graphs";
import { formatDate } from "../utils/dateUtils";

// Access environment-specific API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function FoodTracker({ username }) {
  // State management for food search
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // State management for food logging
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [activeTab, setActiveTab] = useState("log"); // "log" or "add"
  
  // State management for food log
  const [foodLog, setFoodLog] = useState([]);
  const [foodLogDate, setFoodLogDate] = useState(new Date());
  const [isLoadingLog, setIsLoadingLog] = useState(true);
  const [logError, setLogError] = useState(null);
  
  // State management for macro tracking
  const [consumedMacros, setConsumedMacros] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });
  const [totalMacros, setTotalMacros] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });
  const [isLoadingMacros, setIsLoadingMacros] = useState(true);

  /**
   * Process food search results
   * @param {Object} result - API response from USDA search
   */
  const handleSearchResults = (result) => {
    if (Array.isArray(result.foods) && result.foods.length > 0) {
      setSearchResults(result.foods);
    } else {
      setSearchResults([]);
    }
  };

  /**
   * Debounced search function to prevent excessive API calls
   */
  const debouncedSearch = useCallback(
    useDebounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 2) return;
      
      setIsSearching(true);
      setSearchError(null);
      
      try {
        const url = `${API_BASE_URL}/usda?${new URLSearchParams({ 
          query: searchTerm 
        })}`;

        const response = await fetch(url, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Search failed with status: ${response.status}`);
        }

        const result = await response.json();
        handleSearchResults(result);
      } catch (err) {
        console.error("Food search error:", err);
        setSearchError("Failed to search for foods. Please try again.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500), // 500ms debounce delay
    []
  );

  /**
   * Load food entries for the selected date
   */
  const getFoods = async (date) => {
    setIsLoadingLog(true);
    setLogError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/usda/getFoods?${new URLSearchParams({
          username: username,
          createdAt: date.toISOString(),
        })}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        // 404 is expected when no foods are found for a date
        if (response.status === 404) {
          setFoodLog([]);
          setConsumedMacros({ calories: 0, protein: 0, fat: 0, carbs: 0 });
          return;
        }
        
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setFoodLog(result);
      calculateConsumedMacros(result);
    } catch (err) {
      console.error("Error fetching food log:", err);
      setLogError("Failed to load your food log. Please try again later.");
      setFoodLog([]);
      setConsumedMacros({ calories: 0, protein: 0, fat: 0, carbs: 0 });
    } finally {
      setIsLoadingLog(false);
    }
  };

  /**
   * Calculate total macros consumed based on food entries
   */
  const calculateConsumedMacros = (foods) => {
    const totalConsumed = foods.reduce(
      (acc, food) => {
        acc.calories += food.calories || 0;
        acc.protein += food.protein || 0;
        acc.fat += food.fat || 0;
        acc.carbs += food.carbs || 0;
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
    setConsumedMacros(totalConsumed);
  };

  /**
   * Fetch user's target macro goals
   */
  const fetchTotalMacros = async () => {
    setIsLoadingMacros(true);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/stats/getMacros?username=${encodeURIComponent(username)}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        // If no macros are set, just continue without error
        if (response.status === 404) {
          setTotalMacros({
            calories: 2000, // Default values
            protein: 150,
            fat: 65,
            carbs: 225,
          });
          return;
        }
        
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setTotalMacros({
        calories: parseFloat(result.calories),
        protein: parseFloat(result.protein),
        fat: parseFloat(result.fat),
        carbs: parseFloat(result.carbs),
      });
    } catch (err) {
      console.error("Error fetching macro goals:", err);
      // Use defaults if error
      setTotalMacros({
        calories: 2000,
        protein: 150,
        fat: 65,
        carbs: 225,
      });
    } finally {
      setIsLoadingMacros(false);
    }
  };

  // Load data when tab is changed to log
  useEffect(() => {
    if (activeTab === "log") {
      getFoods(foodLogDate);
      fetchTotalMacros();
    }
  }, [activeTab, foodLogDate, username]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length >= 2) {
      debouncedSearch(value);
    } else {
      setSearchResults([]);
    }
  };

  // Handle food selection for logging
  const handleFoodSelect = (food) => {
    const nutritionInfo = food.foodNutrients || [];
    
    // Map USDA nutrition data to our format
    const newFood = {
      description: food.description,
      brandName: food.brandName || food.brandOwner || null,
      protein: nutritionInfo.find(n => n.nutrientName === "Protein")?.value || 0,
      fat: nutritionInfo.find(n => n.nutrientName === "Total lipid (fat)")?.value || 0,
      carbs: nutritionInfo.find(n => n.nutrientName === "Carbohydrate, by difference")?.value || 0,
      calories: nutritionInfo.find(n => n.nutrientName === "Energy")?.value || 0,
    };
    
    setSelectedFood(newFood);
    setIsDialogVisible(true);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle date change for food log
  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    setFoodLogDate(date);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogVisible(false);
    setSelectedFood(null);
    
    // Refresh food log if we were on the log tab
    if (activeTab === "log") {
      getFoods(foodLogDate);
    }
  };

  // Calculate macro percentages
  const calculateMacroPercentages = () => {
    if (consumedMacros.calories === 0) return { protein: 0, fat: 0, carbs: 0 };
    
    return {
      protein: Math.round((consumedMacros.protein * 4 / consumedMacros.calories) * 100),
      fat: Math.round((consumedMacros.fat * 9 / consumedMacros.calories) * 100),
      carbs: Math.round((consumedMacros.carbs * 4 / consumedMacros.calories) * 100),
    };
  };

  const macroPercentages = calculateMacroPercentages();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-center text-4xl font-bold mb-8">Food Tracker</h1>

      {/* Tab navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800 rounded-xl p-1 flex">
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === "log" 
                ? "bg-orange-400 text-white" 
                : "hover:bg-gray-700 text-gray-300"
            }`}
            onClick={() => handleTabChange("log")}
          >
            Food Log
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === "add" 
                ? "bg-orange-400 text-white" 
                : "hover:bg-gray-700 text-gray-300"
            }`}
            onClick={() => handleTabChange("add")}
          >
            Add Food
          </button>
        </div>
      </div>

      {/* Food Log Tab */}
      {activeTab === "log" && (
        <div className="food-log-container">
          {/* Date selector */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <input
                type="date"
                id="food-log-date"
                onChange={handleDateChange}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={formatDate(foodLogDate)}
              />
              <label htmlFor="food-log-date" className="block text-sm text-gray-400 mt-2 text-center">
                Select a date to view your food log
              </label>
            </div>
          </div>

          {/* Error message */}
          {logError && (
            <div className="bg-red-500/30 border border-red-500 text-white p-4 rounded-lg mb-6">
              <p className="text-center">{logError}</p>
            </div>
          )}

          {/* Loading state */}
          {isLoadingLog && (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
            </div>
          )}

          {/* Macro charts */}
          {!isLoadingLog && foodLog.length > 0 && (
            <>
              <div className="bg-gray-800 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-center">Daily Nutrition Summary</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-center">Calories</h3>
                    <div className="flex justify-center">
                      <CaloriesLeft
                        caloriesConsumed={Math.round(consumedMacros.calories)}
                        caloriesTotal={Math.round(totalMacros.calories)}
                      />
                    </div>
                    <p className="text-center mt-3">
                      <span className="font-bold text-xl">
                        {Math.round(consumedMacros.calories)}
                      </span>
                      <span className="text-gray-400 text-sm">
                        /{Math.round(totalMacros.calories)} kcal
                      </span>
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-1">Protein ({macroPercentages.protein}%)</h3>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-orange-400 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (consumedMacros.protein / totalMacros.protein) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-xs mt-1">
                        {Math.round(consumedMacros.protein)}/{Math.round(totalMacros.protein)}g
                      </p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-1">Fat ({macroPercentages.fat}%)</h3>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (consumedMacros.fat / totalMacros.fat) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-xs mt-1">
                        {Math.round(consumedMacros.fat)}/{Math.round(totalMacros.fat)}g
                      </p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-1">Carbs ({macroPercentages.carbs}%)</h3>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (consumedMacros.carbs / totalMacros.carbs) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-xs mt-1">
                        {Math.round(consumedMacros.carbs)}/{Math.round(totalMacros.carbs)}g
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily food log */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Foods Consumed</h2>
                <div className="overflow-hidden overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Food</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Calories</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Protein</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Fat</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Carbs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {foodLog.map((food) => (
                        <tr key={food.id} className="hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{food.description}</div>
                            {food.brandName && (
                              <div className="text-xs text-gray-400">{food.brandName}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">{Math.round(food.calories)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">{Math.round(food.protein)}g</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">{Math.round(food.fat)}g</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">{Math.round(food.carbs)}g</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-orange-400">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">Total</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">{Math.round(consumedMacros.calories)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">{Math.round(consumedMacros.protein)}g</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">{Math.round(consumedMacros.fat)}g</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">{Math.round(consumedMacros.carbs)}g</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => handleTabChange("add")}
                    className="bg-orange-400 hover:bg-orange-500 text-white font-medium px-6 py-3 rounded-lg transition duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                  >
                    Add More Food
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Empty state */}
          {!isLoadingLog && foodLog.length === 0 && (
            <div className="bg-gray-800 rounded-xl p-16 text-center">
              <h2 className="text-2xl font-semibold mb-2">No Foods Logged</h2>
              <p className="text-gray-400 mb-8">You haven't logged any foods for this date.</p>
              <button
                onClick={() => handleTabChange("add")}
                className="bg-orange-400 hover:bg-orange-500 text-white font-medium px-6 py-3 rounded-lg transition duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
              >
                Add Your First Food
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Food Tab */}
      {activeTab === "add" && (
        <div className="food-search-container">
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-center">Search for Foods</h2>
            
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter food name or brand..."
                  value={query}
                  onChange={handleSearchChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-4 pl-12 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Search for foods by name or brand to add to your daily log.
              </p>
            </div>
          </div>

          {/* Error message */}
          {searchError && (
            <div className="bg-red-500/30 border border-red-500 text-white p-4 rounded-lg mb-6">
              <p className="text-center">{searchError}</p>
            </div>
          )}

          {/* Loading state */}
          {isSearching && (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
            </div>
          )}

          {/* Search results */}
          {!isSearching && query && searchResults.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">Search Results</h3>
              <ul className="divide-y divide-gray-700">
                {searchResults.map((food, index) => (
                  <li key={index} className="py-3">
                    <button
                      onClick={() => handleFoodSelect(food)}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition duration-150 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{food.description}</div>
                        {food.brandName && (
                          <div className="text-sm text-gray-400">{food.brandName}</div>
                        )}
                      </div>
                      <div className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                        {food.foodNutrients.find(n => n.nutrientName === "Energy")?.value || "?"} kcal
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Empty state */}
          {!isSearching && query && searchResults.length === 0 && !searchError && (
            <div className="bg-gray-800 rounded-xl p-10 text-center">
              <h3 className="text-lg font-medium mb-2">No Foods Found</h3>
              <p className="text-gray-400">
                Try adjusting your search terms or search for a different food.
              </p>
            </div>
          )}

          {/* Initial state */}
          {!isSearching && !query && (
            <div className="bg-gray-800 rounded-xl p-10 text-center">
              <h3 className="text-lg font-medium mb-2">Start Searching</h3>
              <p className="text-gray-400">
                Enter a food name or brand above to find foods to add to your log.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Food detail dialog */}
      {isDialogVisible && selectedFood && (
        <FoodCard
          {...selectedFood}
          username={username}
          onClose={handleDialogClose}
        />
      )}
    </div>
  );
}
