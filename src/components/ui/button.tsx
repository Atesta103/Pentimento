import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "action" | "danger";

const BASE =
  "inline-flex items-center justify-center rounded-8 px-24 py-12 font-body font-label text-corps " +
  "transition-[background-color] duration-(--duration-base) ease-todo-standard " +
  "disabled:cursor-not-allowed disabled:bg-surface disabled:text-disabled-text";

const VARIANTS: Record<ButtonVariant, string> = {
  action: "bg-action text-blanc hover:bg-action-hover",
  danger: "bg-erreur text-blanc",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "action",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANTS[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
