// A custom recipe page's 404 (Not-found page pattern): an unknown id.
import { ButtonLink, NapkinCard } from "@stirred/ui";
import "../../recipes/recipe.css";

export default function RecipeNotFound() {
  return (
    <div className="container not-found">
      <NapkinCard tilt={-0.8}>
        <title>Recipe not found · Stirred &amp; Strained</title>
        <h1 className="h2">We can&apos;t find that recipe.</h1>
        <p className="not-found__body">
          The link may be old or have a typo. Everything we have starts from the front page.
        </p>
        <ButtonLink href="/">Back to the start</ButtonLink>
      </NapkinCard>
    </div>
  );
}
