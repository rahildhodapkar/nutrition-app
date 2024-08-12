export default function RecipeCard({ label, source, url, image, servings, calories, protein, fat, carbs }) {
  return (
    <figure>
      <img src={image} alt={label} />
      <figcaption>
        <a href={url} target="_blank" rel="noopener nofollow">{label} from {source}</a>
        <ul>
          <li>Servings: {servings}</li>
          <li>Calories per Serving: {calories / servings}kcal</li>
          <li>Protein per Serving: {protein / servings}g</li>
          <li>Fat per Serving: {fat / servings}g</li>
          <li>Carbs per Serving: {carbs / servings}g</li>
        </ul>
      </figcaption>
    </figure>
  );
}