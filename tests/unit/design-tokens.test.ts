import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  TOKENS_CSS,
  TOKENS_JSON,
  generateTokensCss,
} from "../../scripts/generate-tokens";
import tokens from "../../design/tokens.json";

describe("jetons de design", () => {
  it("src/styles/tokens.css est à jour (relancer `node scripts/generate-tokens.ts` sinon)", () => {
    const json = JSON.parse(readFileSync(TOKENS_JSON, "utf8"));
    expect(readFileSync(TOKENS_CSS, "utf8")).toBe(generateTokensCss(json));
  });

  it("espacements, rayons, tailles, hauteurs de ligne et durées sont des multiples de 4", () => {
    const values = [
      ...tokens.spacing,
      ...Object.keys(tokens.radius).map(Number),
      ...Object.values(tokens.font.scale).flatMap((s) => [s.size, s.line]),
      ...Object.values(tokens.motion.durationsMs),
      tokens.focus.ring.widthPx,
      tokens.focus.ring.offsetPx,
    ];
    for (const value of values) {
      expect(value % 4, `${value} n'est pas un multiple de 4`).toBe(0);
    }
  });

  it("aucun texte sous 16 px", () => {
    for (const { size } of Object.values(tokens.font.scale)) {
      expect(size).toBeGreaterThanOrEqual(tokens.font.minSizePx);
    }
  });
});

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(entry) ? [path] : [];
  });
}

describe("aucune couleur écrite en dur", () => {
  // Seul le fichier généré a le droit de contenir des valeurs de couleur.
  const files = sourceFiles("src").filter(
    (f) => !f.endsWith("styles/tokens.css"),
  );

  const FORBIDDEN: [string, RegExp][] = [
    ["couleur hexadécimale", /#[0-9a-fA-F]{3,8}\b/],
    ["rgb()/hsl()/oklch()", /\b(rgba?|hsla?|oklch|oklab|lab|lch|hwb)\s*\(/],
    [
      "valeur arbitraire Tailwind de couleur",
      /\b(?:bg|text|border|fill|stroke|ring|outline|from|to|via)-\[(?:#|rgb|hsl|oklch)/,
    ],
    [
      "palette Tailwind par défaut",
      /\b(?:bg|text|border|fill|stroke|ring)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black)(?:-\d{2,3})?\b/,
    ],
  ];

  it("inspecte bien des fichiers", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const [label, pattern] of FORBIDDEN) {
    it(`pas de ${label}`, () => {
      const offenders = files.filter((f) =>
        pattern.test(readFileSync(f, "utf8")),
      );
      expect(offenders).toEqual([]);
    });
  }
});
