// Minimum legal drinking age and a government help line per country (research 2026-11-01).
// Where an age varies inside a country, the highest applies; anything unlisted gets DEFAULT.
// Legal sign-off: needs-human NH-5. Each source is the page the value was taken from.
export type Help = { name: string; phone?: string; url: string };
export type AgeRule = { country: string; name: string; age: number; help: Help; source: string };

const FALLBACK_HELP: Help = {
  name: "Find A Helpline",
  url: "https://findahelpline.com/topics/substance-use",
};

const rule = (
  country: string,
  name: string,
  age: number,
  source: string,
  help: Help = FALLBACK_HELP,
): AgeRule => ({
  country,
  name,
  age,
  help,
  source,
});

export const AGE_RULES: readonly AgeRule[] = [
  rule("US", "the United States", 21, "https://www.law.cornell.edu/uscode/text/23/158", {
    name: "SAMHSA National Helpline",
    phone: "1-800-662-4357",
    url: "https://www.samhsa.gov/find-help/national-helpline",
  }),
  // 18 in Alberta, Manitoba and Quebec; 19 elsewhere.
  rule("CA", "Canada", 19, "https://www.agco.ca/node/1801", {
    name: "Health Canada: get help with substance use",
    url: "https://www.canada.ca/en/health-canada/services/substance-use/get-help/get-help-problematic-substance-use.html",
  }),
  rule("GB", "the United Kingdom", 18, "https://www.gov.uk/alcohol-young-people-law", {
    name: "Drinkline",
    phone: "0300 123 1110",
    url: "https://www.nhs.uk/live-well/alcohol-advice/alcohol-support/",
  }),
  rule("IE", "Ireland", 18, "https://www.irishstatutebook.ie", {
    name: "HSE Drugs and Alcohol Helpline",
    phone: "1800 459 459",
    url: "https://www2.hse.ie/services/habit-addiction/drugs-and-alcohol-helpline/",
  }),
  // 16 for beer and wine, 18 for spirits (JuSchG §9); cocktails are mostly spirits.
  rule("DE", "Germany", 18, "https://www.gesetze-im-internet.de/juschg/__9.html", {
    name: "Sucht & Drogen Hotline",
    phone: "01806 313031",
    url: "https://www.kenn-dein-limit.de",
  }),
  rule("FR", "France", 18, "https://www.legifrance.gouv.fr", {
    name: "Alcool Info Service",
    phone: "0 980 980 930",
    url: "https://alcool-info-service.fr",
  }),
  rule("ES", "Spain", 18, "https://www.sanidad.gob.es/gabinete/notasPrensa.do?id=6635", {
    name: "Plan Nacional sobre Drogas",
    phone: "900 16 15 15",
    url: "https://pnsd.sanidad.gob.es",
  }),
  rule("IT", "Italy", 18, "https://www.mimit.gov.it", {
    name: "Telefono Verde Alcol (ISS)",
    phone: "800 632000",
    url: "https://www.iss.it/en/alcol",
  }),
  rule(
    "NL",
    "the Netherlands",
    18,
    "https://www.rijksoverheid.nl/onderwerpen/alcohol/alcohol-wetgeving",
    {
      name: "Trimbos Alcohol Infolijn",
      url: "https://www.trimbos.nl",
    },
  ),
  rule("PL", "Poland", 18, "https://isap.sejm.gov.pl", {
    name: "KCPU helpline",
    phone: "800 199 990",
    url: "https://www.kcpu.gov.pl",
  }),
  rule("AU", "Australia", 18, "https://legislation.nsw.gov.au", {
    name: "National Alcohol and Other Drug Hotline",
    phone: "1800 250 015",
    url: "https://www.health.gov.au/contacts/national-alcohol-and-other-drug-hotline",
  }),
  rule("NZ", "New Zealand", 18, "https://www.legislation.govt.nz", {
    name: "Alcohol Drug Helpline",
    phone: "0800 787 797",
    url: "https://alcoholdrughelp.org.nz",
  }),
  rule("JP", "Japan", 20, "https://www.nippon.com/en/japan-data/h01285/"),
  // Counted by calendar year: from 1 January of the year a person turns 19.
  rule("KR", "South Korea", 19, "https://www.law.go.kr"),
  // 18 to 25 by state; some states prohibit alcohol.
  rule("IN", "India", 25, "https://en.wikipedia.org/wiki/Alcohol_laws_of_India", {
    name: "National de-addiction helpline",
    phone: "14446",
    url: "https://nmba.dosje.gov.in",
  }),
  rule("BR", "Brazil", 18, "https://planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13106.htm", {
    name: "Disque Saúde",
    phone: "136",
    url: "https://www.gov.br/saude",
  }),
  rule("MX", "Mexico", 18, "https://www.diputados.gob.mx", {
    name: "Línea de la Vida",
    phone: "800 911 2000",
    url: "https://www.gob.mx/salud/conasama",
  }),
];

/** Unlisted countries: the highest common national age. */
export const DEFAULT_RULE: AgeRule = rule("ZZ", "your country", 21, "docs/plans/M1-11-age-gate.md");

const BY_COUNTRY = new Map(AGE_RULES.map((r) => [r.country, r]));
export const ageRule = (country: string | undefined) =>
  BY_COUNTRY.get((country ?? "").toUpperCase()) ?? DEFAULT_RULE;
