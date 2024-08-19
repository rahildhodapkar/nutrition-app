import { useEffect, useState } from "react";
import { CaloriesLeft, CarbsLeft, FatLeft, ProteinLeft } from "./Graphs";

export default function MacroTracker({ username }) {
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [tdee, setTdee] = useState(null);
  const [proteinPreference, setProteinPreference] = useState("");
  const [carbFatPreference, setCarbFatPreference] = useState("");
  const [macros, setMacros] = useState(null);
  const [displayFormOrGraphs, setDisplayFormOrGraphs] = useState(1);
  const [consumedMacros, setConsumedMacros] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExistingMacros = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/stats/getMacros?username=${username}`,
          {credentials: "include"}
        );
        const result = await response.json();

        if (response.ok && result) {
          setMacros({
            calories: parseFloat(result.calories),
            protein: parseFloat(result.protein),
            fat: parseFloat(result.fat),
            carbs: parseFloat(result.carbs),
          });
        } else {
          console.error("No existing macros found for the user.");
        }
      } catch (err) {
        console.error("Error fetching existing macros:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingMacros();
  }, [username]);

  useEffect(() => {
    if (displayFormOrGraphs === 2 && macros) {
      const fetchConsumedMacros = async () => {
        setIsLoading(true);
        const today = new Date();
        try {
          const foods = await getFoods(today);

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
        } catch (error) {
          console.error("Error fetching food data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchConsumedMacros();
    }
  }, [displayFormOrGraphs, macros]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const weightInKg = parseFloat(weight);
    const heightInCm = parseFloat(height);
    const ageInYears = parseFloat(age);

    let bmr;
    if (sex === "male") {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageInYears + 5;
    } else if (sex === "female") {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageInYears - 161;
    } else {
      bmr = 0;
    }

    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    const tdeeValue = bmr * activityFactors[activityLevel];
    setTdee(tdeeValue);
  };

  const getFoods = async (date) => {
    try {
      const response = await fetch(
        "http://localhost:8081/usda/getFoods?" +
          new URLSearchParams({
            username: username,
            createdAt: date.toISOString(),
          }), {credentials: "include"}
      );
      const result = await response.json();

      if (Array.isArray(result)) {
        return result;
      } else {
        console.error("API did not return an array:", result);
        return [];
      }
    } catch (err) {
      console.error("Error fetching foods:", err);
      return [];
    }
  };

  const calculateMacros = async () => {
    const weightInKg = parseFloat(weight);

    const proteinRange = {
      low: 1.2,
      moderate: 1.6,
      high: 2.2,
    };

    const proteinIntake = weightInKg * proteinRange[proteinPreference];
    const proteinCalories = proteinIntake * 4;

    let fatCalories, carbCalories;
    if (carbFatPreference === "lowCarb") {
      fatCalories = (tdee - proteinCalories) * 0.55;
      carbCalories = tdee - proteinCalories - fatCalories;
    } else {
      fatCalories = (tdee - proteinCalories) * 0.25;
      carbCalories = tdee - proteinCalories - fatCalories;
    }

    const fatIntake = fatCalories / 9;
    const carbIntake = carbCalories / 4;

    const calculatedMacros = {
      calories: tdee.toFixed(2),
      protein: proteinIntake.toFixed(2),
      fat: fatIntake.toFixed(2),
      carbs: carbIntake.toFixed(2),
    };

    setMacros(calculatedMacros);

    try {
      const response = await fetch("http://localhost:8081/stats/upsertMacros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ macros: calculatedMacros, username }),
      });

      if (response.ok) {
        alert("Macros updated successfully!");
      } else {
        alert("Error updating macros, please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating macros, please try again.");
    }
  };

  const handleNavClick = (page) => {
    setDisplayFormOrGraphs(page === "form" ? 1 : 2);
  };

  return (
    <>
      <div className="macro-buttons">
        <button onClick={() => handleNavClick("form")}>
          Update or Set Macros
        </button>
        <button onClick={() => handleNavClick("graphs")}>Graphs</button>
      </div>
      {displayFormOrGraphs === 1 ? (
        <>
          <span>
            Your TDEE is calculated using the Mifflin-St Jeor Equation
          </span>
          <form onSubmit={handleSubmit}>
            <label htmlFor="sex">Sex:</label>
            <select
              id="sex"
              name="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <label htmlFor="age">Age:</label>
            <input
              type="number"
              id="age"
              name="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={18}
              required
            />
            <label htmlFor="weight">Weight (kg):</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min={0}
              required
            />
            <label htmlFor="height">Height (cm):</label>
            <input
              type="number"
              id="height"
              name="height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min={0}
              required
            />
            <label htmlFor="activityLevel">Activity Level:</label>
            <select
              id="activityLevel"
              name="activityLevel"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              required
            >
              <option value="sedentary">
                Sedentary (little to no exercise)
              </option>
              <option value="light">
                Lightly active (light exercise/sports 1-3 days/week)
              </option>
              <option value="moderate">
                Moderately active (moderate exercise/sports 3-5 days/week)
              </option>
              <option value="active">
                Active (hard exercise/sports 6-7 days a week)
              </option>
              <option value="veryActive">
                Very active (very hard exercise/sports & physical job)
              </option>
            </select>
            <button type="submit">Calculate TDEE</button>
          </form>

          {tdee && (
            <div>
              <h2>Your TDEE is: {tdee.toFixed(2)} calories/day</h2>
            </div>
          )}

          {tdee && (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  calculateMacros();
                }}
              >
                <label htmlFor="proteinPreference">Protein Preference:</label>
                <select
                  id="proteinPreference"
                  name="proteinPreference"
                  value={proteinPreference}
                  onChange={(e) => setProteinPreference(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  <option value="low">Low (1.2g per kg)</option>
                  <option value="moderate">Moderate (1.6g per kg)</option>
                  <option value="high">High (2.2g per kg)</option>
                </select>
                <label htmlFor="carbFatPreference">Carb/Fat Preference:</label>
                <select
                  id="carbFatPreference"
                  name="carbFatPreference"
                  value={carbFatPreference}
                  onChange={(e) => setCarbFatPreference(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  <option value="lowCarb">Low Carb / High Fat</option>
                  <option value="highCarb">High Carb / Moderate Fat</option>
                </select>
                <button type="submit">Calculate Macros</button>
              </form>
              {macros && (
                <div>
                  <h2>Your Macros:</h2>
                  <ul>
                    <li>Protein: {macros.protein}g</li>
                    <li>Fat: {macros.fat}g</li>
                    <li>Carbohydrates: {macros.carbs}g</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            macros && (
              <>
                <h2>Macros for Today</h2>
                <CaloriesLeft
                  caloriesConsumed={consumedMacros.calories}
                  caloriesTotal={parseFloat(macros.calories)}
                />
                <ProteinLeft
                  proteinConsumed={consumedMacros.protein}
                  proteinTotal={parseFloat(macros.protein)}
                />
                <FatLeft
                  fatConsumed={consumedMacros.fat}
                  fatTotal={parseFloat(macros.fat)}
                />
                <CarbsLeft
                  carbsConsumed={consumedMacros.carbs}
                  carbsTotal={parseFloat(macros.carbs)}
                />
              </>
            )
          )}
        </>
      )}
    </>
  );
}
