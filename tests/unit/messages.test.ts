import { describe, expect, it } from "vitest";
import en from "@/i18n/messages/en.json";
import fr from "@/i18n/messages/fr.json";

type Tree = { [key: string]: string | Tree };

function leafKeys(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string"
      ? [`${prefix}${key}`]
      : leafKeys(value, `${prefix}${key}.`),
  );
}

describe("fichiers de traduction", () => {
  it("fr.json et en.json ont exactement les mêmes clés", () => {
    expect(leafKeys(en).sort()).toEqual(leafKeys(fr).sort());
  });

  it("aucune traduction n'est vide", () => {
    const empty = (tree: Tree): boolean =>
      Object.values(tree).some((v) =>
        typeof v === "string" ? v.trim() === "" : empty(v),
      );
    expect(empty(fr)).toBe(false);
    expect(empty(en)).toBe(false);
  });
});
