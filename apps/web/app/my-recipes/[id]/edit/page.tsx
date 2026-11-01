// Edit a recipe (M2-06): the recipe form with the saved spec, amounts as the user typed them.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "../../../recipes/recipe.css";
import "../../my-recipes.css";
import { formOptions, myRecipe } from "../../load.ts";
import { RecipeForm } from "../../recipe-form.tsx";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const r = await myRecipe(id, `/my-recipes/${id}/edit`);
  return { title: `Edit ${r.name} · Stirred & Strained` };
}

export default async function EditRecipePage({ params }: Params) {
  const { id } = await params;
  const [r, options] = await Promise.all([myRecipe(id, `/my-recipes/${id}/edit`), formOptions()]);
  if (r.deletedAt) redirect(`/my-recipes/${id}`);
  return (
    <div className="container section">
      <RecipeForm
        id={id}
        title={`Edit ${r.name}`}
        initial={{
          name: r.name,
          method: r.method,
          glass: r.glassId ?? "",
          steps: r.ownSteps ?? "",
          lines: r.lines.map((l) => ({
            ingredient: l.ingredient.name,
            amount: l.entered ? String(Number(l.entered.value.toFixed(6))) : "",
            unit: l.entered?.unit ?? "ml",
            optional: l.optional,
          })),
        }}
        cancel={`/my-recipes/${id}`}
        {...options}
      />
    </div>
  );
}
