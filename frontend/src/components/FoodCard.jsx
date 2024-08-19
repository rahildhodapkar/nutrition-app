import { useState } from "react";

const G_IN_OZ = 28.3495;
const BASE_WEIGHT_IN_G = 100;

export default function FoodCard({
  description,
  brandName,
  protein,
  fat,
  carbs,
  calories,
  username,
  onClose, 
}) {
  const [nutrients, setNutrients] = useState({
    protein: protein,
    fat: fat,
    carbs: carbs,
    calories: calories,
  });

  const [unsuccessfulSubmission, setUnsuccessfulSubmission] = useState(false);
  const [date, setDate] = useState(new Date());
  const [gramsQuery, setGramsQuery] = useState("");
  const [ozQuery, setOzQuery] = useState("");

  let title = description + ` by ${brandName}`;

  const handleNutrients = (grams) => {
    const newNutrients = {
      protein: (protein / BASE_WEIGHT_IN_G) * grams,
      fat: (fat / BASE_WEIGHT_IN_G) * grams,
      carbs: (carbs / BASE_WEIGHT_IN_G) * grams,
      calories: (calories / BASE_WEIGHT_IN_G) * grams,
    };
    setNutrients(newNutrients);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let grams = value;
    if (name === "g") {
      setGramsQuery(value);
    } else {
      setOzQuery(value);
      grams *= G_IN_OZ;
    }
    handleNutrients(grams);
  };

  const handleChangeDate = (e) => {
    const value = e.target.value;
    setDate(new Date(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const reqBody = {
      username: username,
      description: description,
      brandName: brandName,
      protein: protein,
      fat: fat,
      carbs: carbs,
      calories: calories,
      createdAt: date.toISOString(), 
    };

    try {
      const response = await fetch("http://localhost:8081/usda/addFood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(reqBody),
      });

      if (response.ok) {
        onClose(); 
      } else {
        setUnsuccessfulSubmission(true);
      }
    } catch (err) {
      console.error(err);
      setUnsuccessfulSubmission(true);
    }
  };

  return (
    <>
      <div className="backdrop absolute top-0 left-0 right-0 bottom-0 m-auto w-full h-full bg-black opacity-50 z-40"></div>
      <div className="dialog absolute top-0 left-0 right-0 bottom-0 m-auto p-10 w-96 h-96 z-50 bg-slate-700 text-white">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <span>{title}</span>
          <ul>
            <li>Calories: {nutrients.calories}kcal</li>
            <li>Protein: {nutrients.protein}g</li>
            <li>Fat: {nutrients.fat}g</li>
            <li>Carbohydrates (net): {nutrients.carbs}g</li>
          </ul>
          <label htmlFor="g">
            Grams:
            <input
              className="text-black"
              type="number"
              min={0}
              name="g"
              id="g"
              value={gramsQuery}
              onChange={handleChange}
            />
          </label>
          <label htmlFor="oz">
            Ounces:
            <input
              className="text-black"
              type="number"
              min={0}
              name="oz"
              id="oz"
              value={ozQuery}
              onChange={handleChange}
            />
          </label>
          <label htmlFor="date">
            When did you eat this?
            <input
              type="date"
              name="date"
              id="date"
              className="text-black"
              onChange={handleChangeDate}
              value={date.toISOString().split("T")[0]} 
            />
          </label>
          <button type="submit">Add to log</button>
        </form>
        {unsuccessfulSubmission && (
          <span>Error on submission, please try again later.</span>
        )}
      </div>
    </>
  );
}
