// Custom recipes (M2-06): a signed-in user's own specs. Every query runs scoped to that user
// (ADR 0003); another user's id answers 404. Amounts typed in oz or cl are stored canonical, and
// strength is derived like a house recipe's, never stored.
import {
  createDb,
  createUserRecipe,
  deleteUserRecipe,
  getUserRecipe,
  listUserRecipes,
  restoreUserRecipe,
  updateUserRecipe,
  withUser,
  type Db,
  type EnteredUnit,
  type UserLine,
  type UserRecipe,
  type UserSpec,
  type Pool,
} from "@stirred/db";
import {
  ErrorBody,
  GlassList,
  RecipeQuery,
  UserRecipeCreated,
  UserRecipeDetail,
  UserRecipeInput,
  UserRecipeList,
  UserRecipeParams,
} from "@stirred/schema";
import { ML_PER_CL, ML_PER_US_FL_OZ, standardDrinks } from "@stirred/units";
import type { FastifyInstance, FastifyReply } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { requestUser } from "../auth/routes.ts";
import { finished, ref, topName, type Library, type Spec } from "./library.ts";
import { GLASSES, glassName, stepsFor } from "./steps.ts";

const TO_ML: Partial<Record<EnteredUnit, number>> = { ml: 1, cl: ML_PER_CL, oz: ML_PER_US_FL_OZ };
const GLASS_IDS = new Set(GLASSES.map((g) => g.id));

/** A user's live recipe as summaries, search and matching read it. */
export const ownSpec = (r: UserRecipe): Spec => ({ ...r, yours: true });

/** The signed-in user's live recipes, for search and matches; none when signed out. */
export async function liveRecipes(db: Db, userId: string | null): Promise<Spec[]> {
  if (!userId) return [];
  const all = await withUser(db, userId, listUserRecipes);
  return all.filter((r) => r.deletedAt === null).map(ownSpec);
}

type Refusal = "unknown_ingredient" | "unknown_glass" | "no_volume";

/** The input as stored: canonical amounts, tidy steps; or why it cannot be saved. */
function toSpec(lib: Library, input: UserRecipeInput): UserSpec | Refusal {
  if (input.lines.some((l) => !lib.tax.nodes.has(l.ingredient))) return "unknown_ingredient";
  if (input.glass !== undefined && !GLASS_IDS.has(input.glass)) return "unknown_glass";
  const lines: UserLine[] = input.lines.map((l) => {
    if (!l.amount)
      return {
        ingredient: l.ingredient,
        value: null,
        unit: null,
        entered: null,
        optional: l.optional,
      };
    const toMl = TO_ML[l.amount.unit];
    return {
      ingredient: l.ingredient,
      value: toMl === undefined ? l.amount.value : l.amount.value * toMl,
      unit: toMl === undefined ? (l.amount.unit as Exclude<EnteredUnit, "cl" | "oz">) : "ml",
      entered: l.amount.unit,
      optional: l.optional,
    };
  });
  // Strength needs volume: a piece (garnish) has none.
  if (!lines.some((l) => l.unit !== null && l.unit !== "piece")) return "no_volume";
  const steps = (input.steps ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
  return {
    name: input.name,
    method: input.method,
    glass: input.glass ?? null,
    steps: steps || null,
    lines,
  };
}

function saved(lib: Library, spec: UserSpec) {
  return {
    name: spec.name,
    method: spec.method,
    ...(spec.glass ? { glass: glassName(spec.glass) } : {}),
    steps: spec.steps
      ? spec.steps.split("\n")
      : stepsFor(
          spec.method,
          spec.glass,
          spec.lines.filter((l) => l.unit === "top").map((l) => topName(lib, l.ingredient)),
        ),
    lines: spec.lines.map((l) => ({
      ingredient: ref(lib, l.ingredient),
      ...(l.value !== null && l.unit !== null ? { amount: { value: l.value, unit: l.unit } } : {}),
      optional: l.optional,
    })),
  };
}

function detail(
  lib: Library,
  r: NonNullable<Awaited<ReturnType<typeof getUserRecipe>>>,
  country = "ZZ",
): UserRecipeDetail {
  const s = finished(lib, r);
  const base = saved(lib, r);
  return {
    ...base,
    id: r.id,
    yours: true,
    ...(r.glass ? { glassId: r.glass } : {}),
    ...(r.steps ? { ownSteps: r.steps } : {}),
    lines: base.lines.map((l, i) => {
      const line = r.lines[i]!;
      const toMl = line.entered ? TO_ML[line.entered] : undefined;
      return {
        ...l,
        ...(line.value !== null && line.entered
          ? {
              entered: {
                value: toMl === undefined ? line.value : line.value / toMl,
                unit: line.entered,
              },
            }
          : {}),
      };
    }),
    strength: { abv: s.abv, volumeMl: s.volumeMl, drinks: standardDrinks(s, country) },
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    ...(r.deletedAt ? { deletedAt: r.deletedAt } : {}),
    history: r.events.map((e) => ({
      kind: e.kind,
      at: e.at,
      ...(e.spec ? { spec: saved(lib, e.spec) } : {}),
    })),
  };
}

export function myRecipeRoutes(app: FastifyInstance, { pool, lib }: { pool: Pool; lib: Library }) {
  const db = createDb(pool);
  const r = app.withTypeProvider<ZodTypeProvider>();
  const signedOut = (reply: FastifyReply) => reply.code(401).send({ error: "signed_out" });
  const notFound = (reply: FastifyReply) => reply.code(404).send({ error: "not_found" });

  r.get(
    "/glasses",
    { schema: { operationId: "listGlasses", response: { 200: GlassList } } },
    async () => ({ items: GLASSES }),
  );

  r.get(
    "/my/recipes",
    {
      schema: { operationId: "listMyRecipes", response: { 200: UserRecipeList, 401: ErrorBody } },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const all = await withUser(db, userId, listUserRecipes);
      return {
        items: all
          .filter((x) => x.deletedAt === null)
          .map((x) => {
            const s = finished(lib, x);
            return {
              id: x.id,
              name: x.name,
              method: x.method,
              ...(x.glass ? { glass: glassName(x.glass) } : {}),
              abv: s.abv,
              yours: true as const,
            };
          }),
        deleted: all.flatMap((x) =>
          x.deletedAt ? [{ id: x.id, name: x.name, deletedAt: x.deletedAt }] : [],
        ),
      };
    },
  );

  r.post(
    "/my/recipes",
    {
      schema: {
        operationId: "createMyRecipe",
        body: UserRecipeInput,
        response: { 201: UserRecipeCreated, 400: ErrorBody, 401: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const spec = toSpec(lib, req.body);
      if (typeof spec === "string") return reply.code(400).send({ error: spec });
      const id = await withUser(db, userId, (s) => createUserRecipe(s, spec));
      return reply.code(201).send({ id });
    },
  );

  r.get(
    "/my/recipes/:id",
    {
      schema: {
        operationId: "getMyRecipe",
        params: UserRecipeParams,
        querystring: RecipeQuery,
        response: { 200: UserRecipeDetail, 401: ErrorBody, 404: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const found = await withUser(db, userId, (s) => getUserRecipe(s, req.params.id));
      if (!found) return notFound(reply);
      return detail(lib, found, req.query.country);
    },
  );

  r.put(
    "/my/recipes/:id",
    {
      schema: {
        operationId: "updateMyRecipe",
        params: UserRecipeParams,
        body: UserRecipeInput,
        response: { 204: z.null(), 400: ErrorBody, 401: ErrorBody, 404: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const spec = toSpec(lib, req.body);
      if (typeof spec === "string") return reply.code(400).send({ error: spec });
      const changed = await withUser(db, userId, (s) => updateUserRecipe(s, req.params.id, spec));
      if (changed === 0) return notFound(reply);
      return reply.code(204).send(null);
    },
  );

  r.delete(
    "/my/recipes/:id",
    {
      schema: {
        operationId: "deleteMyRecipe",
        params: UserRecipeParams,
        response: { 204: z.null(), 401: ErrorBody, 404: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const n = await withUser(db, userId, (s) => deleteUserRecipe(s, req.params.id));
      if (n === 0) return notFound(reply);
      return reply.code(204).send(null);
    },
  );

  r.post(
    "/my/recipes/:id/restore",
    {
      schema: {
        operationId: "restoreMyRecipe",
        params: UserRecipeParams,
        response: { 204: z.null(), 401: ErrorBody, 404: ErrorBody },
      },
    },
    async (req, reply) => {
      const userId = await requestUser(db, req);
      if (!userId) return signedOut(reply);
      const n = await withUser(db, userId, (s) => restoreUserRecipe(s, req.params.id));
      if (n === 0) return notFound(reply);
      return reply.code(204).send(null);
    },
  );
}
