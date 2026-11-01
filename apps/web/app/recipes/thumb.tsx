// A recipe row's link and thumbnail: house recipes have a photo and a /recipes page; a user's
// own (M2-06) has the photo placeholder and lives under /my-recipes.
import { PhotoNone } from "@stirred/ui";

type Ref = { id: string; yours?: true | undefined };

export const recipeHref = (r: Ref) => (r.yours ? `/my-recipes/${r.id}` : `/recipes/${r.id}`);

export function RecipeThumb({ r }: { r: Ref }) {
  if (r.yours) return <PhotoNone thumb className="result__photo" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized thumbnails
    <img
      className="result__photo"
      src={`/photos/recipes/thumbs/${r.id}.jpg`}
      alt=""
      width={56}
      height={70}
      loading="lazy"
    />
  );
}
