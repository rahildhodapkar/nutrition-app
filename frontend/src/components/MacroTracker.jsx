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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchExistingMacros = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/stats/getMacros?username=${username}`,
          { credentials: "include" }
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
        `${API_BASE_URL}/usda/getFoods?` +
          new URLSearchParams({
            username: username,
            createdAt: date.toISOString(),
          }),
        { credentials: "include" }
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
      const response = await fetch(`${API_BASE_URL}/stats/upsertMacros`, {
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
      <h1 className="text-center text-4xl m-8">Macros</h1>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        macros && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-8 mb-8">
            <div className="p-2 text-center">
              Calories
              <CaloriesLeft
                caloriesConsumed={consumedMacros.calories}
                caloriesTotal={parseFloat(macros.calories)}
              />
            </div>
            <div className="p-2 text-center">
              Protein
              <ProteinLeft
                proteinConsumed={consumedMacros.protein}
                proteinTotal={parseFloat(macros.protein)}
              />
            </div>
            <div className="p-2 text-center">
              Fat
              <FatLeft
                fatConsumed={consumedMacros.fat}
                fatTotal={parseFloat(macros.fat)}
              />
            </div>
            <div className="p-2 text-center">
              Carbohydrates
              <CarbsLeft
                carbsConsumed={consumedMacros.carbs}
                carbsTotal={parseFloat(macros.carbs)}
              />
            </div>
          </div>
        )
      )}

      <div className="grid place-content-center">
        <span className="text-center m-8">
          Your TDEE is calculated using the Mifflin-St Jeor Equation
        </span>
        <form onSubmit={handleSubmit} className="grid gap-4 p-8">
          <label htmlFor="sex">Sex:</label>
          <select
            id="sex"
            name="sex"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className="text-black p-2 rounded-xl"
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
            className="text-black p-2 rounded-xl"
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
            className="text-black p-2 rounded-xl"
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
            className="text-black p-2 rounded-xl"
          />
          <label htmlFor="activityLevel">Activity Level:</label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            required
            className="text-black p-2 rounded-xl"
          >
            <option value="sedentary">Sedentary (little to no exercise)</option>
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
          <button
            type="submit"
            className="justify-self-center border-orange-400 border-2 p-2 rounded-xl w-52 hover:bg-orange-400 transition duration-300 ease-out"
          >
            Calculate TDEE
          </button>
        </form>

        {tdee && (
          <div>
            <h2 className="text-center m-8">
              Your TDEE is: {tdee.toFixed(2)} calories/day
            </h2>
          </div>
        )}

        {tdee && (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                calculateMacros();
              }}
              className="grid gap-4 p-8"
            >
              <label htmlFor="proteinPreference">Protein Preference:</label>
              <select
                id="proteinPreference"
                name="proteinPreference"
                value={proteinPreference}
                onChange={(e) => setProteinPreference(e.target.value)}
                required
                className="text-black p-2 rounded-xl"
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
                className="text-black p-2 rounded-xl"
              >
                <option value="">Select</option>
                <option value="lowCarb">Low Carb / High Fat</option>
                <option value="highCarb">High Carb / Moderate Fat</option>
              </select>
              <button
                type="submit"
                className="justify-self-center border-orange-400 border-2 p-2 rounded-xl w-52 hover:bg-orange-400 transition duration-300 ease-out"
              >
                Calculate Macros
              </button>
            </form>
            {macros && (
              <div className="text-center">
                <h2 className="text-2xl mb-3">Your Macros</h2>
                <ul>
                  <li>Protein: {Math.round(macros.protein)}g</li>
                  <li>Fat: {Math.round(macros.fat)}g</li>
                  <li>Carbs: {Math.round(macros.carbs)}g</li>
                </ul>
              </div>
            )}
          </>
        )}

        <h4 className="text-2xl text-center mt-56">Disclaimer</h4>
        <p className="w-[50ch] text-[.85rem] justify-self-center p-4 mb-8">
          The Mifflin-St Jeor equation is a widely used method to estimate daily
          calorie needs, but it is just that—an estimate. Individual factors
          such as metabolism, activity level, and overall health can
          significantly influence your actual calorie requirements. This
          equation should not be taken as a definitive calculation. Before
          making any changes to your diet or embarking on a new health regimen,
          it's essential to consult with a medical professional to ensure that
          any adjustments are safe and appropriate for your specific needs.
        </p>
      </div>
    </>
  );
}
