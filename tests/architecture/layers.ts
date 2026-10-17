import { cruise, type IForbiddenRuleType } from "dependency-cruiser";

/**
 * Les 5 couches de docs/architecture/architecture.md, de la plus haute (1) à la
 * plus basse (5). Une couche n'importe que la couche juste en dessous.
 * Les motifs commencent par `(^|/)src/` pour fonctionner aussi sur les dossiers
 * d'exemple de tests/architecture/fixtures.
 */
export const LAYERS = [
  {
    name: "presentation",
    path: "(^|/)src/(app/(?!api/)|components/)",
  },
  { name: "entry", path: "(^|/)src/(server/actions/|app/api/)" },
  { name: "services", path: "(^|/)src/server/(services|access)/" },
  { name: "repositories", path: "(^|/)src/server/repositories/" },
  { name: "data", path: "(^|/)src/server/db/" },
] as const;

/** `lib/` est du code pur : il ne dépend d'aucune couche. */
const PURE_UTILITIES_PATH = "(^|/)src/lib/";

export function buildForbiddenRules(): IForbiddenRuleType[] {
  const rules: IForbiddenRuleType[] = [];

  LAYERS.forEach((from, fromIndex) => {
    LAYERS.forEach((to, toIndex) => {
      const allowed = toIndex === fromIndex || toIndex === fromIndex + 1;
      if (allowed) return;
      rules.push({
        name: `layer-${from.name}-must-not-import-${to.name}`,
        comment: `${from.name} ne peut importer que la couche juste en dessous (${LAYERS[fromIndex + 1]?.name ?? "aucune"}).`,
        severity: "error",
        from: { path: from.path },
        to: { path: to.path },
      });
    });
  });

  for (const layer of LAYERS) {
    rules.push({
      name: `lib-must-not-import-${layer.name}`,
      comment: "lib/ est pur : aucune dépendance vers une couche.",
      severity: "error",
      from: { path: PURE_UTILITIES_PATH },
      to: { path: layer.path },
    });
  }

  return rules;
}

export type LayerViolation = { rule: string; from: string; to: string };

/** Analyse `root` et renvoie la liste des imports interdits (vide = OK). */
export async function findLayerViolations(
  root: string,
): Promise<LayerViolation[]> {
  const result = await cruise([root], {
    ruleSet: { forbidden: buildForbiddenRules() },
    validate: true,
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
  });

  const output = result.output;
  if (typeof output === "string") {
    throw new Error("dependency-cruiser a renvoyé du texte au lieu d'un objet");
  }

  return output.summary.violations.map((violation) => ({
    rule: violation.rule.name,
    from: violation.from,
    to: violation.to,
  }));
}
