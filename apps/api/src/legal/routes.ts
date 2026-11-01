import { AgeRulesQuery, AgeRulesResponse } from "@stirred/schema";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { AGE_RULES, ageRule } from "./drinking-age.ts";

const countries = AGE_RULES.map(({ country, name }) => ({ country, name })).sort((a, b) =>
  a.name.replace(/^the /, "").localeCompare(b.name.replace(/^the /, "")),
);

export function legalRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/age-rules",
    {
      schema: {
        operationId: "getAgeRules",
        querystring: AgeRulesQuery,
        response: { 200: AgeRulesResponse },
      },
    },
    async (req) => {
      const { country, name, age, help } = ageRule(req.query.country);
      return { rule: { country, name, age, help }, countries };
    },
  );
}
