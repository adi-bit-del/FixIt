import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "danger"
  | "ghost";

export type ButtonSize =
  | "sm"
  | "md"
  | "lg";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<
  ButtonVariant,
  string
> = {
  primary:
    "bg-[var(--fixit-primary)] text-white hover:bg-[var(--fixit-primary-hover)] active:bg-[var(--fixit-primary-active)] focus-visible:ring-4 focus-visible:ring-[var(--fixit-primary-ring)]",

  secondary:
    "border border-[var(--fixit-border)] bg-[var(--fixit-surface)] text-[var(--fixit-primary)] hover:border-[rgb(29_78_216_/_0.24)] hover:bg-[var(--fixit-primary-soft)] active:border-[var(--fixit-primary)] active:bg-[rgb(29_78_216_/_0.12)]",

  accent:
    "bg-[var(--fixit-secondary)] text-white hover:bg-[var(--fixit-secondary-hover)] active:bg-[#d9006d] focus-visible:ring-4 focus-visible:ring-[rgb(255_0_127_/_0.20)]",

  danger:
    "bg-[var(--fixit-danger)] text-white hover:bg-[#ef4444] active:bg-[#b91c1c] focus-visible:ring-4 focus-visible:ring-[rgb(220_38_38_/_0.20)]",

  ghost:
    "bg-transparent text-[var(--fixit-text)] hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)] active:bg-[rgb(29_78_216_/_0.12)]",
};

const sizeClasses: Record<
  ButtonSize,
  string
> = {
  sm:
    "min-h-9 rounded-[var(--fixit-radius-sm)] px-3 text-xs",

  md:
    "min-h-11 rounded-[var(--fixit-radius-md)] px-4 text-sm",

  lg:
    "min-h-12 rounded-[var(--fixit-radius-lg)] px-6 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled =
    disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        "inline-flex items-center justify-center gap-2",
        "font-semibold leading-none",
        "transition-[background-color,border-color,color,box-shadow,transform]",
        "duration-150 ease-in-out",
        "focus-visible:outline-none",
        "active:translate-y-px",
        "disabled:pointer-events-none disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}