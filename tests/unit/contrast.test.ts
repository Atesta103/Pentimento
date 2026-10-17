import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";
import tokens from "../../design/tokens.json";

const { color, state, contrast } = tokens;
const MINIMUM = contrast.minimum;

type StateName = keyof typeof state;
const STATE_NAMES = Object.keys(state) as StateName[];

/** Les 4 vérifications par état de docs/brand/design-direction.md. */
function checksFor(name: StateName) {
  const { forte, teinte } = state[name];
  return {
    "forte/fond": contrastRatio(forte, color.fond),
    "forte/teinte": contrastRatio(forte, teinte),
    "blanc/forte": contrastRatio(color.blanc, forte),
    "texte/teinte": contrastRatio(color.texte, teinte),
  };
}

describe("contraste des couleurs d'état (WCAG AA, minimum 4,5)", () => {
  for (const name of STATE_NAMES) {
    describe(name, () => {
      for (const [pair, ratio] of Object.entries(checksFor(name))) {
        it(`${pair} ≥ ${MINIMUM}`, () => {
          expect(ratio).toBeGreaterThanOrEqual(MINIMUM);
        });
      }
    });
  }

  it("couvre bien 4 états × 4 vérifications = 16", () => {
    const total = STATE_NAMES.flatMap((n) => Object.keys(checksFor(n)));
    expect(total).toHaveLength(16);
  });

  it("les ratios calculés correspondent au tableau de référence (à 0,01 près)", () => {
    for (const name of STATE_NAMES) {
      const reference = contrast.reference_ratios[name];
      for (const [pair, ratio] of Object.entries(checksFor(name))) {
        expect(ratio, `${name} ${pair}`).toBeCloseTo(
          reference[pair as keyof typeof reference],
          2,
        );
      }
    }
  });
});

describe("contraste des autres paires du design", () => {
  const other = contrast.other_reference_ratios;

  it("texte sur fond et sur surface ≥ 4,5", () => {
    expect(contrastRatio(color.texte, color.fond)).toBeGreaterThanOrEqual(
      MINIMUM,
    );
    expect(contrastRatio(color.texte, color.surface)).toBeGreaterThanOrEqual(
      MINIMUM,
    );
  });

  it("bouton d'action : blanc sur action et sur action au survol ≥ 4,5", () => {
    expect(contrastRatio(color.blanc, color.action)).toBeCloseTo(
      other["blanc/action"],
      2,
    );
    expect(
      contrastRatio(color.blanc, color["action-hover"]),
    ).toBeGreaterThanOrEqual(MINIMUM);
  });

  it("anneau de focus : action sur fond ≥ 3 (exigence WCAG pour un composant)", () => {
    const ratio = contrastRatio(color.action, color.fond);
    expect(ratio).toBeCloseTo(other["action/fond"], 2);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it("texte désactivé : lisible mais exempté du niveau AA (≥ 3)", () => {
    const ratio = contrastRatio(color["disabled-text"], color.surface);
    expect(ratio).toBeCloseTo(other["disabled-text/surface"], 2);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});
