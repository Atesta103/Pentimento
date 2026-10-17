import { describe, expect, it } from "vitest";
import { findLayerViolations } from "./layers";

describe("architecture en 5 couches", () => {
  it("le code réel de src/ respecte la règle « une couche appelle celle du dessous »", async () => {
    expect(await findLayerViolations("src")).toEqual([]);
  });

  it("accepte une chaîne d'imports valide (exemple de contrôle)", async () => {
    const violations = await findLayerViolations(
      "tests/architecture/fixtures/valid/src",
    );
    expect(violations).toEqual([]);
  });

  it("refuse la présentation qui importe un dépôt (preuve que le test échoue)", async () => {
    const violations = await findLayerViolations(
      "tests/architecture/fixtures/violation/src",
    );
    expect(violations.map((v) => v.rule)).toEqual([
      "layer-presentation-must-not-import-repositories",
    ]);
  });
});
