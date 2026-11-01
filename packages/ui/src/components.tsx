// Bar Napkin base components (docs/design/patterns.md). Presentational only: no data fetching,
// no business logic. Classes live in styles.css.
import type { ComponentProps, CSSProperties, ReactNode } from "react";

type Tilt = { tilt?: number };
const tiltStyle = (tilt?: number) =>
  tilt === undefined ? undefined : ({ "--tilt": `${tilt}deg` } as CSSProperties);

export function ButtonLink({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
}) {
  return (
    <a href={href} className={`btn btn--${variant}`}>
      {children}
    </a>
  );
}

export function Button({
  variant = "primary",
  children,
  ...rest
}: { variant?: "primary" | "secondary"; children: ReactNode } & ComponentProps<"button">) {
  return (
    <button type="button" className={`btn btn--${variant}`} {...rest}>
      {children}
    </button>
  );
}

export function Chip({
  name,
  value,
  defaultChecked,
  children,
}: {
  name: string;
  value: string;
  defaultChecked?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="chip">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} />
      <span className="chip__tick" aria-hidden="true">
        ✓
      </span>
      {children}
    </label>
  );
}

export function Select({
  id,
  name,
  label,
  options,
  value,
}: {
  id: string;
  name: string;
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
}) {
  return (
    <span className="select">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} defaultValue={value}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  );
}

export function SegmentedControl({
  name,
  legend,
  options,
  value,
}: {
  name: string;
  legend: string;
  options: readonly { value: string; label: string }[];
  value: string;
}) {
  return (
    <fieldset className="seg">
      <legend className="vh">{legend}</legend>
      {options.map((o) => (
        <label key={o.value}>
          <input type="radio" name={name} value={o.value} defaultChecked={o.value === value} />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}

export function SearchInput({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder: string;
}) {
  return (
    <label className="search">
      <SearchIcon />
      <span className="vh">{label}</span>
      <input type="search" name={name} placeholder={placeholder} />
    </label>
  );
}

export function NapkinCard({
  tilt,
  tape = true,
  children,
}: Tilt & { tape?: boolean; children: ReactNode }) {
  return (
    <div className="napkin tilt" style={tiltStyle(tilt)}>
      {tape && <div className="tape" aria-hidden="true" />}
      {children}
    </div>
  );
}

export type RecipeCardLine = { name: string; amount: string };

export function RecipeCard({
  id,
  name,
  blurb,
  photo,
  lines,
  method,
  strength,
  credit,
  href,
  tilt,
}: Tilt & {
  id: string;
  name: string;
  blurb?: string;
  photo?: { src: string; alt: string; focus?: string };
  lines: readonly RecipeCardLine[];
  method: string;
  strength: ReactNode;
  credit: string;
  href: string;
}) {
  return (
    <article aria-labelledby={id} className="recipe-card tilt" style={tiltStyle(tilt)}>
      <div className="tape" aria-hidden="true" />
      {photo && (
        <div className="photo-frame">
          <img src={photo.src} alt={photo.alt} style={{ objectPosition: photo.focus }} />
        </div>
      )}
      <div className="recipe-card__body">
        <h3 id={id} className="recipe-card__title">
          {name}
        </h3>
        {blurb && <p className="hand recipe-card__blurb">{blurb}</p>}
        <ul className="lines">
          {lines.map((l) => (
            <li key={l.name}>
              <span>{l.name}</span>
              <span className="amount">{l.amount}</span>
            </li>
          ))}
        </ul>
        <p className="recipe-card__method">{method}</p>
        <p className="strength">{strength}</p>
        <p className="credit">{credit}</p>
        <a href={href} className="recipe-card__more">
          Full recipe →
        </a>
      </div>
    </article>
  );
}

export function StickyNote({
  colour,
  number,
  title,
  tilt,
  children,
}: Tilt & {
  colour: "yellow" | "white" | "green";
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={`sticky sticky--${colour} tilt`} style={tiltStyle(tilt)}>
      <p className="hand sticky__num">{number}</p>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

export function Tag({ kind, children }: { kind: "house" | "yours"; children: ReactNode }) {
  return <span className={`tag tag--${kind}`}>{children}</span>;
}

export function TableCard({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="table-card">
      <table>
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function Dialog({
  id,
  labelledBy,
  open,
  children,
}: {
  id: string;
  labelledBy: string;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <dialog id={id} aria-labelledby={labelledBy} className="dialog" open={open}>
      {children}
    </dialog>
  );
}

export function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
  );
}

/** Photo placeholder (M2-06): where no photo exists, a line-drawn glass; decorative only. */
export function PhotoNone({ thumb, className }: { thumb?: boolean; className?: string }) {
  return (
    <span
      className={["photo-none", thumb ? "photo-none--thumb" : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 80" focusable="false">
        <path d="M12 22H52" />
        <path d="M12 22 16 70q0 4 4 4h24q4 0 4-4l4-48" />
        <path d="M14.5 40h35" strokeDasharray="3 4" />
        <rect x="22" y="44" width="14" height="14" rx="2" transform="rotate(-8 29 51)" />
      </svg>
      {!thumb && <span className="photo-none__hand">yours!</span>}
    </span>
  );
}
