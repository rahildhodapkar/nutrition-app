import { useCallback, useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import FoodCard from "./FoodCard";
import { CaloriesLeft, ProteinLeft, FatLeft, CarbsLeft } from "./Graphs"; // Import the charts

export default function FoodTracker({ username }) {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState("Nothing to see here");
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [displayLogOrAdd, setDisplayLogOrAdd] = useState(1);
  const [foodLog, setFoodLog] = useState("Nothing to see here");
  const [foodLogDate, setFoodLogDate] = useState(new Date());
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
  const [isLoading, setIsLoading] = useState(true);

  const handleResults = (result) => {
    setFoods(result.foods);
  };

  const debouncedSearch = useCallback(
    useDebounce(async (searchTerm) => {
      const url =
        "http://localhost:8081/usda?" +
        new URLSearchParams({ query: searchTerm });

      try {
        const response = await fetch(url, {
          credentials: "include"
        });
        const result = await response.json();

        if (response.ok) {
          handleResults(result);
        } else {
          setFoods("Nothing to see here");
        }
      } catch (err) {
        setFoods("Nothing to see here");
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (displayLogOrAdd === 1) {
      getFoods(foodLogDate);
      fetchTotalMacros();
    }
  }, [displayLogOrAdd, foodLogDate]);

  const getFoods = async (date) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8081/usda/getFoods?" +
          new URLSearchParams({
            username: username,
            createdAt: date.toISOString(),
          }), {
            credentials: "include"
          }
      );
      const result = await response.json();

      if (response.ok) {
        setFoodLog(result);
        calculateConsumedMacros(result);
      } else {
        setFoodLog("No foods at this date.");
        setConsumedMacros({ calories: 0, protein: 0, fat: 0, carbs: 0 });
      }
    } catch (err) {
      console.error(err);
      setFoodLog("An error occurred");
      setConsumedMacros({ calories: 0, protein: 0, fat: 0, carbs: 0 });
    } finally {
      setIsLoading(false);
    }
  };

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

  const fetchTotalMacros = async () => {
    try {
      const response = await fetch(
        `http://localhost:8081/stats/getMacros?username=${username}`
      , {credentials: "include"});
      const result = await response.json();

      if (response.ok && result) {
        setTotalMacros({
          calories: parseFloat(result.calories),
          protein: parseFloat(result.protein),
          fat: parseFloat(result.fat),
          carbs: parseFloat(result.carbs),
        });
      } else {
        console.error("No total macros found for the user.");
      }
    } catch (err) {
      console.error("Error fetching total macros:", err);
    }
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value.length > 0) {
      debouncedSearch(e.target.value);
    } else {
      setFoods("Nothing to see here");
    }
  };

  const handleClick = (food) => {
    const newFood = {
      description: food.description,
      brandName: food.brandName,
      protein: food.foodNutrients[0]?.value || 0,
      fat: food.foodNutrients[1]?.value || 0,
      carbs: food.foodNutrients[2]?.value || 0,
      calories: food.foodNutrients[3]?.value || 0,
    };
    setSelectedFood(newFood);
    setIsDialogVisible(true);
  };

  const handleNavClick = (page) => {
    setDisplayLogOrAdd(page === "log" ? 1 : 2);
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setFoodLogDate(new Date(val));
  };

  const handleDialogClose = () => {
    setIsDialogVisible(false);
    setSelectedFood(null);
  };

  return (
    <>
      <div className="food-buttons">
        <button onClick={() => handleNavClick("log")}>Food Log</button>
        <button onClick={() => handleNavClick("add")}>Add a Food</button>
      </div>
      {displayLogOrAdd === 1 ? (
        <div className="food-track-container">
          <label htmlFor="food-log-date">
            <input
              type="date"
              name="food-log-date"
              id="food-log-date"
              onChange={handleDateChange}
              value={foodLogDate.toISOString().split("T")[0]}
            />
          </label>
          {typeof foodLog === "string" ? (
            <p>{foodLog}</p>
          ) : (
            <ul>
              {foodLog.map((food) => (
                <li key={food.id}>{food.description}</li>
              ))}
            </ul>
          )}
          {!isLoading && typeof foodLog !== "string" && (
            <div className="macro-charts">
              <CaloriesLeft
                caloriesConsumed={consumedMacros.calories}
                caloriesTotal={totalMacros.calories}
              />
              <ProteinLeft
                proteinConsumed={consumedMacros.protein}
                proteinTotal={totalMacros.protein}
              />
              <FatLeft
                fatConsumed={consumedMacros.fat}
                fatTotal={totalMacros.fat}
              />
              <CarbsLeft
                carbsConsumed={consumedMacros.carbs}
                carbsTotal={totalMacros.carbs}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="food-search-container">
          <label htmlFor="search">
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Search..."
              value={query}
              onChange={handleChange}
            />
          </label>
          <div>
            {typeof foods === "string" ? (
              <p>{foods}</p>
            ) : (
              <ul>
                {foods.map((food, index) => (
                  <li key={index}>
                    <button onClick={() => handleClick(food)}>
                      {food.brandName
                        ? food.description + ` by ${food.brandName}`
                        : food.description}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {isDialogVisible && selectedFood && (
        <FoodCard
          {...selectedFood}
          username={username}
          onClose={handleDialogClose}
        />
      )}
    </>
  );
}
