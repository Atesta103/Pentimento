/**
 * Génère src/styles/tokens.css à partir de design/tokens.json (source unique).
 * Usage : node scripts/generate-tokens.ts
 * Un test vérifie que le fichier généré est à jour.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

type StateTokens = { forte: string; teinte: string };
type Tokens = {
  color: Record<string, string>;
  state: Record<string, StateTokens>;
  banner: { borderOpacityPercent: number };
  font: {
    heading: { family: string; fallback: string; weight: number };
    body: {
      family: string;
      fallback: string;
      weights: Record<string, number>;
    };
    scale: Record<string, { size: number; line: number }>;
    readingWidthCh: number;
  };
  spacing: number[];
  radius: Record<string, string>;
  focus: { ring: { widthPx: number; offsetPx: number } };
  motion: {
    durationsMs: Record<string, number>;
    easing: Record<string, string>;
  };
};

const ROOT = new URL("..", import.meta.url);
export const TOKENS_JSON = fileURLToPath(new URL("design/tokens.json", ROOT));
export const TOKENS_CSS = fileURLToPath(new URL("src/styles/tokens.css", ROOT));

export function generateTokensCss(tokens: Tokens): string {
  const lines: string[] = [];
  const add = (name: string, value: string | number) =>
    lines.push(`  ${name}: ${value};`);

  lines.push(
    "/* GÉNÉRÉ par scripts/generate-tokens.ts depuis design/tokens.json : ne pas modifier à la main. */",
    "/* Chaque famille est remise à zéro (`initial`) pour que Tailwind n'offre QUE les jetons de Pentimento. */",
    "@theme static {",
  );

  lines.push("  --color-*: initial;");
  for (const [name, value] of Object.entries(tokens.color)) {
    add(`--color-${name}`, value);
  }
  for (const [name, state] of Object.entries(tokens.state)) {
    add(`--color-${name}`, state.forte);
    add(`--color-${name}-fond`, state.teinte);
    add(
      `--color-${name}-bordure`,
      `color-mix(in srgb, var(--color-${name}) ${tokens.banner.borderOpacityPercent}%, transparent)`,
    );
  }

  lines.push("", "  --font-*: initial;");
  add(
    "--font-heading",
    `"${tokens.font.heading.family}", ${tokens.font.heading.fallback}`,
  );
  add(
    "--font-body",
    `"${tokens.font.body.family}", ${tokens.font.body.fallback}`,
  );
  lines.push("  --font-weight-*: initial;");
  add("--font-weight-heading", tokens.font.heading.weight);
  for (const [name, weight] of Object.entries(tokens.font.body.weights)) {
    add(`--font-weight-${name}`, weight);
  }

  lines.push("", "  --text-*: initial;");
  for (const [name, { size, line }] of Object.entries(tokens.font.scale)) {
    add(`--text-${name}`, `${size}px`);
    add(`--text-${name}--line-height`, `${line}px`);
  }
  lines.push("  --container-*: initial;");
  add("--container-reading", `${tokens.font.readingWidthCh}ch`);

  lines.push("", "  --spacing-*: initial;");
  for (const px of tokens.spacing) add(`--spacing-${px}`, `${px}px`);

  lines.push("", "  --radius-*: initial;");
  for (const px of Object.keys(tokens.radius)) add(`--radius-${px}`, `${px}px`);

  lines.push(
    "",
    "  /* Aucune ombre dans la direction artistique. */",
    "  --shadow-*: initial;",
    "  --inset-shadow-*: initial;",
    "  --drop-shadow-*: initial;",
    "  --text-shadow-*: initial;",
  );

  lines.push("", "  /* Focus : anneau qui suit l'arrondi de l'élément. */");
  add("--focus-ring-width", `${tokens.focus.ring.widthPx}px`);
  add("--focus-ring-offset", `${tokens.focus.ring.offsetPx}px`);

  lines.push(
    "",
    "  /* Mouvement. Les courbes `todo-*` sont provisoires (voir design/tokens.json, _todo). */",
  );
  lines.push("  --ease-*: initial;");
  for (const [name, ms] of Object.entries(tokens.motion.durationsMs)) {
    add(`--duration-${name}`, `${ms}ms`);
  }
  for (const [name, curve] of Object.entries(tokens.motion.easing)) {
    add(`--ease-${name}`, curve);
  }

  lines.push("}", "");
  return lines.join("\n");
}

function main() {
  const tokens = JSON.parse(readFileSync(TOKENS_JSON, "utf8")) as Tokens;
  writeFileSync(TOKENS_CSS, generateTokensCss(tokens));
  console.log(`Écrit : ${TOKENS_CSS}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
