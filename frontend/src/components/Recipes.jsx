import { useState, useEffect } from "react";
import RecipeCard from "./RecipeCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Recipes() {
  const [formData, setFormData] = useState({
    ingredients: "",
    calories: "",
  });

  const [recipesToShow, setRecipesToShow] = useState("No recipes to display");

  useEffect(() => {
    const storedRecipes = sessionStorage.getItem("recipesToShow");
    if (storedRecipes) {
      setRecipesToShow(JSON.parse(storedRecipes));
    }
  }, []);

  const handleRecipes = (result) => {
    const jsonHits = result.hits;
    setRecipesToShow(jsonHits);
    sessionStorage.setItem("recipesToShow", JSON.stringify(jsonHits));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_BASE_URL}/edamam?` +
          new URLSearchParams({
            ingredients: formData.ingredients,
            calories: formData.calories,
          }).toString(), {
            credentials: "include"
          }
      );

      const result = await response.json();
      if (response.ok) {
        handleRecipes(result);
      } else {
        setRecipesToShow(response.message || "Error, please try again later.");
      }
    } catch (err) {
      console.error(err);
      setRecipesToShow("Error, please try again later.");
    }
  };

  return (
    <>
      <h1 className="text-center text-4xl mt-8">What do you want to eat?</h1>
      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="w-full lg:w-1/2 p-8 grid place-items-center gap-4">
          <label htmlFor="ingredients" className="flex flex-col w-3/5">
            Recipe:
            <input
              className="rounded-xl p-2 text-black"
              type="text"
              id="ingredients"
              name="ingredients"
              placeholder="Search..."
              onChange={handleChange}
            />
          </label>
          <label htmlFor="calories" className="flex flex-col w-3/5">
            Maximum calories (kcal) per serving
            <input
              type="range"
              min={0}
              max={2000}
              id="calories"
              name="calories"
              onChange={handleChange}
            />
          </label>
          <button type="submit" className="border-orange-400 border-2 p-2 w-32 rounded-lg hover:bg-orange-400 transition duration-300 ease-out">Submit</button>
        </form>
      </div>
      <div className="recipes-container">
        {typeof recipesToShow === "string" ? (
          <p className="text-center">{recipesToShow}</p>
        ) : (
          <div>
            <h3 className="text-center text-3xl">Results</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-8 gap-4">
              {recipesToShow.map((hit, index) => {
                const recipe = hit.recipe;
                if (recipe) {
                  const params = {
                    label: recipe.label,
                    source: recipe.source,
                    url: recipe.url,
                    image: recipe.image,
                    servings: recipe.yield,
                    calories: Math.round(recipe.calories),
                    protein: Math.round(recipe.totalNutrients.PROCNT.quantity),
                    fat: Math.round(recipe.totalNutrients.FAT.quantity),
                    carbs: Math.round(recipe.totalNutrients.CHOCDF.quantity),
                  };
                  return (
                    <div key={index}>
                      <RecipeCard {...params} />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
