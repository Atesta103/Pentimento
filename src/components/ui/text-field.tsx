import { CircleAlert } from "lucide-react";
import { useId, type InputHTMLAttributes } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  /** Message d'erreur : affiche l'état d'erreur (bordure, icône et texte). */
  error?: string;
  hint?: string;
};

export function TextField({
  label,
  error,
  hint,
  className = "",
  ...props
}: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex flex-col gap-8">
      <label htmlFor={id} className="font-body font-label text-corps">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="font-body font-caption text-legende">
          {hint}
        </p>
      ) : null}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`rounded-8 border bg-blanc px-16 py-12 font-body text-corps text-texte ${
          error ? "border-erreur" : "border-texte"
        } disabled:cursor-not-allowed disabled:border-disabled-text disabled:bg-surface disabled:text-disabled-text ${className}`.trim()}
        {...props}
      />
      {error ? (
        <p
          id={errorId}
          className="flex items-center gap-8 font-body font-label text-legende text-erreur"
        >
          <CircleAlert aria-hidden="true" size={20} className="shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
