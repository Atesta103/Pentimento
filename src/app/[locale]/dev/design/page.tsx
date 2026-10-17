import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { use } from "react";
import { Banner, type BannerState } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

const STATES: BannerState[] = ["erreur", "succes", "attention", "info"];

// Classes écrites en toutes lettres : Tailwind ne génère que ce qu'il lit dans le code.
const SWATCHES = [
  { name: "fond", className: "bg-fond border" },
  { name: "texte", className: "bg-texte" },
  { name: "action", className: "bg-action" },
  { name: "action-hover", className: "bg-action-hover" },
  { name: "surface", className: "bg-surface" },
  { name: "disabled-text", className: "bg-disabled-text" },
  { name: "erreur", className: "bg-erreur" },
  { name: "succes", className: "bg-succes" },
  { name: "attention", className: "bg-attention" },
  { name: "info", className: "bg-info" },
] as const;

export default function DesignDemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Page de développement : introuvable en production.
  if (process.env.NODE_ENV === "production") notFound();

  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("DesignDemo");

  return (
    <main className="mx-auto flex max-w-reading flex-col gap-48 px-16 py-48">
      <header className="flex flex-col gap-8">
        <h1 className="text-titre-1">{t("title")}</h1>
        <p className="text-corps-grand">{t("intro")}</p>
      </header>

      <section className="flex flex-col gap-16">
        <h2 className="text-titre-3">{t("colors")}</h2>
        <ul className="grid grid-cols-2 gap-16">
          {SWATCHES.map((swatch) => (
            <li key={swatch.name} className="flex items-center gap-12">
              <span
                className={`size-32 rounded-8 border-texte ${swatch.className}`}
              />
              <span className="text-legende">{swatch.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-titre-3">{t("typography")}</h2>
        <p className="font-heading text-display">{t("sample")}</p>
        <p className="font-heading text-titre-1">{t("sample")}</p>
        <p className="font-heading text-titre-2">{t("sample")}</p>
        <p className="font-heading text-titre-3">{t("sample")}</p>
        <p className="font-heading text-titre-4">{t("sample")}</p>
        <p className="text-corps-grand">{t("sample")}</p>
        <p className="text-corps">{t("sample")}</p>
        <p className="font-caption text-legende">{t("sample")}</p>
      </section>

      <section className="flex flex-col gap-16">
        <h2 className="text-titre-3">{t("buttons")}</h2>
        <div className="flex flex-wrap gap-16">
          <Button>{t("buttonAction")}</Button>
          <Button variant="danger">{t("buttonDanger")}</Button>
          <Button disabled>{t("buttonDisabled")}</Button>
        </div>
      </section>

      <section className="flex flex-col gap-16">
        <h2 className="text-titre-3">{t("banners")}</h2>
        {STATES.map((state) => (
          <Banner key={state} state={state} title={t(`banner.${state}.title`)}>
            <p>{t(`banner.${state}.body`)}</p>
          </Banner>
        ))}
      </section>

      <section className="flex flex-col gap-16">
        <h2 className="text-titre-3">{t("fields")}</h2>
        <TextField label={t("fieldLabel")} hint={t("fieldHint")} />
        <TextField
          label={t("fieldLabel")}
          error={t("fieldError")}
          defaultValue="…"
        />
        <TextField label={t("fieldLabel")} disabled defaultValue="…" />
      </section>
    </main>
  );
}
