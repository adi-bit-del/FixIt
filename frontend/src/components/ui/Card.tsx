import type {
  HTMLAttributes,
  ReactNode,
} from "react";

export type CardVariant =
  | "default"
  | "interactive";

interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

const variantClasses: Record<
  CardVariant,
  string
> = {
  default:
    "border-[var(--fixit-border)] bg-[var(--fixit-surface)] shadow-[var(--fixit-shadow-sm)]",

  interactive:
    "border-[var(--fixit-border)] bg-[var(--fixit-surface)] shadow-[var(--fixit-shadow-sm)] hover:border-[rgb(29_78_216_/_0.20)] hover:shadow-[var(--fixit-shadow-md)]",
};

export default function Card({
  variant = "default",
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-[var(--fixit-radius-lg)] border",
        "transition-[border-color,box-shadow]",
        "duration-200 ease-in-out",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}