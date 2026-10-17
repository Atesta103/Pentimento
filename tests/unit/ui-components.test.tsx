import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Banner, type BannerState } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

const STATES: BannerState[] = ["erreur", "succes", "attention", "info"];

describe("Banner", () => {
  it("chaque état a une icône de forme différente (jamais la couleur seule)", () => {
    const icons = STATES.map((state) => {
      const html = renderToStaticMarkup(<Banner state={state} title="t" />);
      const match = /lucide-([a-z-]+)/.exec(html);
      return match?.[1];
    });
    expect(icons.every(Boolean)).toBe(true);
    expect(new Set(icons).size).toBe(4);
  });

  it("l'icône est décorative et le titre est lisible", () => {
    const html = renderToStaticMarkup(<Banner state="info" title="Titre" />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Titre");
  });

  it("une erreur est annoncée comme alerte, les autres comme statut", () => {
    expect(renderToStaticMarkup(<Banner state="erreur" title="t" />)).toContain(
      'role="alert"',
    );
    expect(renderToStaticMarkup(<Banner state="succes" title="t" />)).toContain(
      'role="status"',
    );
  });
});

describe("Button", () => {
  it("est de type button par défaut (ne soumet pas un formulaire par accident)", () => {
    expect(renderToStaticMarkup(<Button>ok</Button>)).toContain(
      'type="button"',
    );
  });

  it("le bouton de danger utilise la couleur d'erreur, le désactivé reste désactivé", () => {
    expect(renderToStaticMarkup(<Button variant="danger">x</Button>)).toContain(
      "bg-erreur",
    );
    expect(renderToStaticMarkup(<Button disabled>x</Button>)).toContain(
      "disabled",
    );
  });
});

describe("TextField", () => {
  it("relie le libellé au champ et signale l'erreur", () => {
    const html = renderToStaticMarkup(
      <TextField label="Nom" error="Obligatoire" />,
    );
    expect(html).toMatch(/<label[^>]*for="([^"]+)"/);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("aria-describedby");
    expect(html).toContain("Obligatoire");
  });

  it("sans erreur, pas d'état d'erreur", () => {
    const html = renderToStaticMarkup(<TextField label="Nom" />);
    expect(html).not.toContain("aria-invalid");
  });
});
