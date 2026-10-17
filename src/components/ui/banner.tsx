import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

export type BannerState = "erreur" | "succes" | "attention" | "info";

/** Une forme d'icône différente par état : la couleur ne porte jamais seule l'information. */
const ICONS = {
  erreur: CircleAlert,
  succes: CircleCheck,
  attention: TriangleAlert,
  info: Info,
} satisfies Record<BannerState, unknown>;

const STYLES: Record<BannerState, { box: string; title: string }> = {
  erreur: { box: "bg-erreur-fond border-erreur-bordure", title: "text-erreur" },
  succes: { box: "bg-succes-fond border-succes-bordure", title: "text-succes" },
  attention: {
    box: "bg-attention-fond border-attention-bordure",
    title: "text-attention",
  },
  info: { box: "bg-info-fond border-info-bordure", title: "text-info" },
};

type BannerProps = {
  state: BannerState;
  title: string;
  children?: ReactNode;
};

export function Banner({ state, title, children }: BannerProps) {
  const Icon = ICONS[state];
  const style = STYLES[state];

  return (
    <div
      role={state === "erreur" ? "alert" : "status"}
      className={`flex gap-12 rounded-8 border p-16 text-texte ${style.box}`}
    >
      <Icon
        aria-hidden="true"
        size={24}
        className={`shrink-0 ${style.title}`}
      />
      <div>
        <p className={`font-body font-label ${style.title}`}>{title}</p>
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}
