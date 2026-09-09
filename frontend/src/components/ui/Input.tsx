import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

export default function Input({
  id,
  label,
  error,
  hint,
  leftElement,
  rightElement,
  className = "",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) {
  const generatedId =
    id ||
    (label
      ? label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : undefined);

  const hintId = generatedId
    ? `${generatedId}-hint`
    : undefined;

  const errorId = generatedId
    ? `${generatedId}-error`
    : undefined;

  const describedBy = [
    ariaDescribedBy,
    hint && hintId,
    error && errorId,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  const hasError = Boolean(error);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={generatedId}
          className="mb-2 block text-sm font-semibold text-[var(--fixit-text)]"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftElement && (
          <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-[var(--fixit-text-muted)]">
            {leftElement}
          </div>
        )}

        <input
          id={generatedId}
          aria-invalid={
            hasError
              ? true
              : ariaInvalid
          }
          aria-describedby={
            describedBy
          }
          className={[
            "min-h-11 w-full rounded-[var(--fixit-radius-md)]",
            "border bg-[var(--fixit-surface)]",
            "px-4 text-sm text-[var(--fixit-text)]",
            "outline-none",
            "placeholder:text-[var(--fixit-text-muted)]",
            "transition-[border-color,box-shadow,background-color]",
            "duration-150 ease-in-out",
            "hover:border-[rgb(100_116_139_/_0.45)]",
            "focus:border-[var(--fixit-primary)]",
            "focus:ring-4 focus:ring-[var(--fixit-primary-ring)]",
            "disabled:cursor-not-allowed",
            "disabled:bg-[var(--fixit-disabled-soft)]",
            "disabled:text-[var(--fixit-disabled)]",
            hasError
              ? "border-[var(--fixit-error)] focus:border-[var(--fixit-error)] focus:ring-[rgb(239_68_68_/_0.15)]"
              : "border-[var(--fixit-border)]",
            leftElement
              ? "pl-10"
              : "",
            rightElement
              ? "pr-10"
              : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p
          id={errorId}
          className="mt-2 text-xs font-medium text-[var(--fixit-error)]"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={hintId}
          className="mt-2 text-xs text-[var(--fixit-text-muted)]"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}