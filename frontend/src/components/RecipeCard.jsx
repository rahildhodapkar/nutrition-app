export default function RecipeCard({
  label,
  source,
  url,
  image,
  servings,
  calories,
  protein,
  fat,
  carbs,
}) {
  return (
    <figure className="flex flex-col p-4 w-auto border-orange-400 border-2 rounded-xl h-full">
      <img src={image} alt={label} className="rounded-xl" />
      <figcaption>
        <h3 className="text-center text-lg fill-white hover:text-orange-400 hover:fill-orange-400 transition duration-300 ease-out">
          <a href={url} target="_blank" rel="noopener nofollow">
            {label} from {source}{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              className="inline-block"
            >
              <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z" />
            </svg>
          </a>
        </h3>
        <ul className="p-4 grid gap-2 text-sm">
          <li>Servings: {servings}</li>
          <li>Calories per Serving: {Math.round(calories / servings)}kcal</li>
          <li>Protein per Serving: {Math.round(protein / servings)}g</li>
          <li>Fat per Serving: {Math.round(fat / servings)}g</li>
          <li>Carbs per Serving: {Math.round(carbs / servings)}g</li>
        </ul>
      </figcaption>
    </figure>
  );
}
