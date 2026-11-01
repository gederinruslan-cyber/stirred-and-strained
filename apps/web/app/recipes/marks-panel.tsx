// "Your take" (M2-07, docs/design/marks.md): the visitor's favourite, rating and private note on
// a recipe, in the recipe page's side column; a prompt to sign in when signed out.
import "server-only";
import type { Mark } from "@stirred/schema";
import Link from "next/link";
import { api } from "../../lib/api.ts";
import { apiHeaders } from "../../lib/session.ts";
import { setFavourite, undoNote } from "./mark-actions.ts";
import { TakeForm } from "./take-form.tsx";

/** The visitor's mark on the recipe, or null when signed out (or the session has ended). */
export async function markFor(id: string): Promise<Mark | null> {
  const headers = await apiHeaders();
  if (!headers.authorization) return null;
  const { data, response } = await api.GET("/my/marks/{id}", { params: { path: { id } }, headers });
  if (response.status === 401) return null;
  if (!data) throw new Error(`the api did not answer /my/marks (${response.status})`);
  return data;
}

export function MarksPanel({
  recipe,
  own = false,
  mark,
  marked,
}: {
  recipe: { id: string; name: string };
  own?: boolean;
  mark: Mark | null;
  /** What the last post did (`?marked=`). */
  marked: string | undefined;
}) {
  const page = `/${own ? "my-recipes" : "recipes"}/${recipe.id}`;
  const hidden = (
    <>
      <input type="hidden" name="id" value={recipe.id} />
      {own && <input type="hidden" name="own" value="1" />}
    </>
  );
  const status =
    marked === "fav-on"
      ? `${recipe.name} is in your favourites.`
      : marked === "fav-off"
        ? `${recipe.name} is out of your favourites.`
        : marked === "saved" || marked === "saved-note"
          ? `Saved your take on ${recipe.name}.`
          : marked === "undone"
            ? `Your note on ${recipe.name} is back as it was.`
            : null;
  return (
    <section aria-labelledby="marks-h" className="marks sticky sticky--white">
      <h2 id="marks-h" className="recipe__h2">
        Your take
      </h2>
      {mark && status && (
        <p className="marks__status" role="status" tabIndex={-1} autoFocus>
          {status}
          {marked === "saved-note" && (
            <>
              {" "}
              <form action={undoNote} className="inline-form">
                {hidden}
                <button type="submit" className="linkish">
                  Undo<span className="vh"> the note change</span>
                </button>
              </form>
            </>
          )}
        </p>
      )}
      {mark && marked === "down" && (
        <p className="form-error" role="alert" tabIndex={-1} autoFocus>
          Something went wrong on our side. Nothing changed. Try again in a minute.
        </p>
      )}
      {mark ? (
        <>
          <form action={setFavourite} className="marks__fav">
            {hidden}
            <input type="hidden" name="favourite" value={mark.favourite ? "false" : "true"} />
            <button
              type="submit"
              className={
                mark.favourite ? "btn btn--secondary marks__fav--on" : "btn btn--secondary"
              }
            >
              <span aria-hidden="true">{mark.favourite ? "♥" : "♡"}</span>{" "}
              {mark.favourite ? "Remove from favourites" : "Add to favourites"}
            </button>
          </form>
          <TakeForm
            id={recipe.id}
            own={own}
            initial={{ rating: mark.rating ? String(mark.rating) : "", note: mark.note ?? "" }}
          />
        </>
      ) : (
        <div className="marks__signin sticky sticky--yellow">
          <p>
            <Link href={`/sign-in?back=${encodeURIComponent(page)}`}>Sign in</Link> to keep a
            favourite, a rating and a note. New here?{" "}
            <Link href={`/sign-up?back=${encodeURIComponent(page)}`}>Create an account</Link>.
          </p>
        </div>
      )}
    </section>
  );
}

/** Beside a name in a list: the visitor's favourite and rating, in words for screen readers. */
export function MarkTags({
  favourite,
  rating,
}: {
  favourite?: boolean | undefined;
  rating?: number | undefined;
}) {
  if (!favourite && !rating) return null;
  return (
    <span className="mark-tags">
      {favourite && (
        <span>
          <span aria-hidden="true">♥</span>
          <span className="vh">, in your favourites</span>
        </span>
      )}
      {rating && (
        <span>
          <span aria-hidden="true">{rating}★</span>
          <span className="vh">, you rated it {rating} of 5</span>
        </span>
      )}
    </span>
  );
}
