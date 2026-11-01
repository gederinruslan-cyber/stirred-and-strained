// New recipe (M2-06): the recipe form, empty.
import type { Metadata } from "next";
import "../../recipes/recipe.css";
import "../my-recipes.css";
import { formOptions, signedInHeaders } from "../load.ts";
import { RecipeForm } from "../recipe-form.tsx";

export const metadata: Metadata = { title: "New recipe · Stirred & Strained" };

export default async function NewRecipePage() {
  await signedInHeaders("/my-recipes/new");
  const options = await formOptions();
  return (
    <div className="container section">
      <RecipeForm
        title="New recipe"
        initial={{ name: "", method: "", glass: "", steps: "", lines: [] }}
        cancel="/my-recipes"
        {...options}
      />
    </div>
  );
}
