import useDebounce from "../hooks/useDebounce";
import { useState, useCallback } from "react";

export default function FoodTracker() {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState("Nothing to see here");

  const handleResults = (result) => {
    setFoods(result.foods);
  };

  const debouncedSearch = useCallback(
    useDebounce(async (searchTerm) => {
      const url =
        "http://localhost:8081/usda?" +
        new URLSearchParams({ query: searchTerm });

      try {
        const response = await fetch(url);
        const result = await response.json();

        if (response.ok) {
          handleResults(result);
        } else {
          console.log("Error:", result.message || "Failed to fetch data");
          setFoods("Nothing to see here");
        }
      } catch (err) {
        console.error("Error:", err);
        setFoods("Nothing to see here");
      }
    }, 300),
    []
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value.length > 0) {
      debouncedSearch(e.target.value);
    } else {
      setFoods("Nothing to see here")
    }
  };

  return (
    <>
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
              <li key={index}>{food.description}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
