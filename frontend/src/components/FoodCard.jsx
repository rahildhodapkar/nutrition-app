import { useState } from "react";

const G_IN_OZ = 28.3495;
const BASE_WEIGHT_IN_G = 100;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
      const response = await fetch(`${API_BASE_URL}/usda/addFood`, {
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
      <div className="dialog fixed top-0 left-0 right-0 bottom-0 m-auto p-10 w-80 sm:w-96 md:w-1/2 z-50 backdrop-blur-sm h-fit bg-zinc-300/30 rounded-xl text-white flex justify-center">
        <button
          className="absolute top-4 right-4 text-white text-xl font-bold hover:text-orange-400 transition duration-300 ease-out"
          onClick={onClose}
        >
          &times;
        </button>
        <form onSubmit={handleSubmit} className="flex flex-col xl:w-1/2">
          <h2 className="text-center text-2xl">{title}</h2>
          <ul className="mt-4 mb-4">
            <li>Calories: {Math.round(nutrients.calories)}kcal</li>
            <li>Protein: {Math.round(nutrients.protein)}g</li>
            <li>Fat: {Math.round(nutrients.fat)}g</li>
            <li>Carbohydrates (net): {Math.round(nutrients.carbs)}g</li>
          </ul>
          <label htmlFor="g" className="flex flex-col">
            Grams:
            <input
              className="text-black rounded-xl p-2"
              type="number"
              min={0}
              name="g"
              id="g"
              value={gramsQuery}
              onChange={handleChange}
            />
          </label>
          <label htmlFor="oz" className="mt-2 flex flex-col">
            Ounces:
            <input
              className="text-black rounded-xl p-2"
              type="number"
              min={0}
              name="oz"
              id="oz"
              value={ozQuery}
              onChange={handleChange}
            />
          </label>
          <label htmlFor="date" className="mt-2 flex flex-col">
            When did you eat this?
            <input
              type="date"
              name="date"
              id="date"
              className="text-black rounded-xl p-2"
              onChange={handleChangeDate}
              value={date.toISOString().split("T")[0]} 
            />
          </label>
          <button type="submit" className=" mt-4 border-orange-400 border-2 p-2 w-full rounded-lg hover:bg-orange-400 transition duration-300 ease-out">Add to log</button>
        </form>
        {unsuccessfulSubmission && (
          <span>Error on submission, please try again later.</span>
        )}
      </div>
    </>
  );
}
