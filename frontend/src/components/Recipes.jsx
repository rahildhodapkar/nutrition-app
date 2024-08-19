import { useState, useEffect } from "react";
import RecipeCard from "./RecipeCard";

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
        "http://localhost:8081/edamam?" +
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
      <form onSubmit={handleSubmit}>
        <label htmlFor="ingredients">
          <span>What do you want to eat?</span>
          <p>For example: honey miso salmon</p>
          <input
            type="text"
            id="ingredients"
            name="ingredients"
            onChange={handleChange}
          />
        </label>

        <label htmlFor="calories">
          <span>
            Maximum number of calories (kcal) you want in each serving
          </span>
          <input
            type="range"
            min={0}
            max={2000}
            id="calories"
            name="calories"
            onChange={handleChange}
          />
        </label>

        <button type="submit">Submit</button>
      </form>
      <div className="recipes-container">
        {typeof recipesToShow === "string" ? (
          <p>{recipesToShow}</p>
        ) : (
          <ul>
            {recipesToShow.map((hit, index) => {
              const recipe = hit.recipe;
              if (recipe) {
                const params = {
                  label: recipe.label,
                  source: recipe.source,
                  url: recipe.url,
                  image: recipe.image,
                  servings: recipe.yield,
                  calories: recipe.calories,
                  protein: recipe.totalNutrients.PROCNT.quantity,
                  fat: recipe.totalNutrients.FAT.quantity,
                  carbs: recipe.totalNutrients.CHOCDF.quantity,
                };
                return (
                  <li key={index}>
                    <RecipeCard {...params} />
                  </li>
                );
              }
              return null;
            })}
          </ul>
        )}
      </div>
    </>
  );
}
