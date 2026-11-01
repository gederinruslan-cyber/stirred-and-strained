// Landing copy and photos that are presentation, not recipe data (the api serves the recipes).
export const PICKS: Record<
  string,
  { blurb: string; photo: { src: string; alt: string; focus: string }; tilt: number }
> = {
  negroni: {
    blurb: "bitter, boozy, gorgeous",
    photo: {
      src: "/photos/negroni.jpg",
      alt: "A Negroni on ice with an orange slice, on a dark wooden bar",
      focus: "45% 50%",
    },
    tilt: -1.2,
  },
  "old-fashioned": {
    blurb: "the original, still the best",
    photo: {
      src: "/photos/old-fashioned.jpg",
      alt: "An Old Fashioned with two big ice cubes and an orange wheel on a wooden board",
      focus: "50% 60%",
    },
    tilt: 0.8,
  },
  margarita: {
    blurb: "sour, salty, bright",
    photo: {
      src: "/photos/margarita.jpg",
      alt: "A Margarita with a salted rim and a lime wedge",
      focus: "50% 30%",
    },
    tilt: -0.6,
  },
  "temperance-grapefruit-collins": {
    blurb: "bright, bitter, no proof",
    photo: {
      src: "/photos/zero-proof-highball.jpg",
      alt: "A tall, pale golden zero-proof highball over ice with a dried citrus wheel",
      focus: "50% 62%",
    },
    tilt: 1.1,
  },
};

/** The demo's starting shelf on a first visit. */
export const DEFAULT_BOTTLES = ["gin", "sweet-vermouth", "campari"];
export const UNITS = [
  { value: "ml", label: "ml" },
  { value: "cl", label: "cl" },
  { value: "oz", label: "oz" },
] as const;
