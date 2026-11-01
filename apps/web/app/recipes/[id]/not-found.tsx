// The recipe page's 404 (Not-found page pattern): an unknown id, or an alcoholic recipe asked
// for in a locked zero-proof session. Never shows any part of the recipe refused.
import { ButtonLink, NapkinCard } from "@stirred/ui";
import { readPrefs } from "../../../lib/prefs.ts";
import "../recipe.css";

export default async function RecipeNotFound() {
  const { zeroLocked } = await readPrefs();
  return (
    <div className="container not-found">
      <NapkinCard tilt={-0.8}>
        {zeroLocked ? (
          <>
            <title>Not on the zero-proof side · Stirred &amp; Strained</title>
            <h1 className="h2">That one&apos;s not on the zero-proof side of the bar.</h1>
            <p className="not-found__body">
              You&apos;re seeing the zero-proof side, so every recipe here is 0% ABV, with the same
              detail and the same care.
            </p>
            <ButtonLink href="/#zero-h">See zero-proof recipes</ButtonLink>
          </>
        ) : (
          <>
            <title>Recipe not found · Stirred &amp; Strained</title>
            <h1 className="h2">We can&apos;t find that recipe.</h1>
            <p className="not-found__body">
              The link may be old or have a typo. Everything we have starts from the front page.
            </p>
            <ButtonLink href="/">Back to the start</ButtonLink>
          </>
        )}
      </NapkinCard>
    </div>
  );
}
