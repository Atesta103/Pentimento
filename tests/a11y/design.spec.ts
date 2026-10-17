import { expect, test } from "@playwright/test";

const PAGE = "/fr/dev/design";

test("le focus au clavier est visible : anneau de 4 px en couleur d'action, décalé de 4 px", async ({
  page,
}) => {
  await page.goto(PAGE);

  // Tab jusqu'au premier bouton (clavier uniquement, pas de clic).
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveJSProperty("tagName", "BUTTON");

  const ring = await focused.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      width: s.outlineWidth,
      style: s.outlineStyle,
      offset: s.outlineOffset,
      color: s.outlineColor,
    };
  });
  expect(ring).toEqual({
    width: "4px",
    style: "solid",
    offset: "4px",
    color: "rgb(62, 107, 106)", // #3E6B6A, couleur d'action
  });
});

test("les champs de saisie reçoivent aussi l'anneau de focus", async ({
  page,
}) => {
  await page.goto(PAGE);
  await page.getByRole("textbox").first().focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  const width = await page
    .getByRole("textbox")
    .first()
    .evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(width).toBe("4px");
});

test("« réduire les animations » supprime toute transition", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PAGE);
  const duration = await page
    .getByRole("button", { name: "Action", exact: true })
    .evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(duration).toBe("0s");
});

test("sans « réduire les animations », le bouton transitionne en 320 ms", async ({
  page,
}) => {
  await page.goto(PAGE);
  const duration = await page
    .getByRole("button", { name: "Action", exact: true })
    .evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(duration).toBe("0.32s");
});

test("les titres sont en Young Serif prévu, graisse 400, et aucun texte sous 16 px", async ({
  page,
}) => {
  await page.goto(PAGE);
  const h1 = await page.locator("h1").evaluate((el) => {
    const s = getComputedStyle(el);
    return { weight: s.fontWeight, family: s.fontFamily };
  });
  expect(h1.weight).toBe("400");
  expect(h1.family).toContain("Young Serif");

  const smallest = await page.evaluate(() => {
    let min = Infinity;
    for (const el of document.querySelectorAll("main *")) {
      if (
        el.childNodes.length &&
        [...el.childNodes].some(
          (n) => n.nodeType === 3 && n.textContent?.trim(),
        )
      ) {
        min = Math.min(min, parseFloat(getComputedStyle(el).fontSize));
      }
    }
    return min;
  });
  expect(smallest).toBeGreaterThanOrEqual(16);
});

test("chaque bandeau d'état affiche une icône SVG différente", async ({
  page,
}) => {
  await page.goto(PAGE);
  const shapes = await page
    .locator("main [role='alert'] svg, main [role='status'] svg")
    .evaluateAll((svgs) =>
      svgs.map((s) => s.getAttribute("class")?.match(/lucide-[a-z-]+/)?.[0]),
    );
  expect(shapes).toHaveLength(4);
  expect(new Set(shapes).size).toBe(4);
});
