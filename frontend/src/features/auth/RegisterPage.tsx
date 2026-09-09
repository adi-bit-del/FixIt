import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  Home,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  Link,
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "./AuthContext";
import { register as registerApi } from "./authApi";

import FixItLogo from "../../components/FixItLogo";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

import type { UserRole } from "../../types/auth";

type RegisterRole = "CUSTOMER" | "PROFESSIONAL";

export default function RegisterPage() {
  const {
    user,
    isLoading: authLoading,
  } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleFromUrl = normalizeRole(
    searchParams.get("role"),
  );

  const [selectedRole, setSelectedRole] =
    useState<RegisterRole | null>(roleFromUrl);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    setSelectedRole(
      normalizeRole(searchParams.get("role")),
    );
  }, [searchParams]);

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      matches:
        password.length > 0 &&
        password === confirmPassword,
    }),
    [password, confirmPassword],
  );

  if (!authLoading && user) {
    return (
      <Navigate
        to={getRolePath(user.roles)}
        replace
      />
    );
  }

  function handleRoleSelect(
    role: RegisterRole,
  ) {
    setSelectedRole(role);
    setError("");

    navigate(
      {
        pathname: "/register",
        search: `?role=${role.toLowerCase()}`,
      },
      {
        replace: true,
      },
    );
  }

  function handleBack() {
    setSelectedRole(null);
    setError("");
    setPassword("");
    setConfirmPassword("");

    navigate(
      {
        pathname: "/register",
      },
      {
        replace: true,
      },
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedRole) {
      return;
    }

    setError("");

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newUser = await registerApi({
        email: normalizedEmail,
        password,
        role: selectedRole,
      });

      const roleQuery =
        selectedRole === "PROFESSIONAL"
          ? "professional"
          : "customer";

      navigate(
        `/login?role=${roleQuery}`,
        {
          replace: true,
          state: {
            registrationComplete: true,
            registeredEmail: newUser.email,
          },
        },
      );
    } catch (error: unknown) {
      const message =
        getApiErrorMessage(error);

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--fixit-background)] text-[var(--fixit-text)]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ============================================================
            BRAND PANEL
        ============================================================ */}

        <section className="relative hidden overflow-hidden bg-[var(--fixit-primary)] lg:flex">
          <div className="absolute -right-28 top-10 h-80 w-80 rounded-full bg-[var(--fixit-secondary)]/20 blur-3xl" />

          <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            <Link
  to="/"
  aria-label="FixIt home"
  className="flex w-fit items-center"
>
  <FixItLogo
    variant="horizontal-white"
    size="sm"
    alt="FixIt"
    className="h-7 w-auto max-w-[145px]"
  />
</Link>

            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                <Sparkles size={14} />
                Get started with FixIt
              </div>

              <h1 className="text-5xl font-bold leading-[1.02] tracking-[-0.05em] text-white xl:text-6xl">
                One place to
                <span className="block text-white/75">
                  get things done.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/75 xl:text-lg">
                Find trusted service professionals
                or build your own service business
                through one connected platform.
              </p>

              <div className="mt-8 space-y-3">
                <Benefit
                  icon={<ShieldCheck size={17} />}
                  text="Built around trusted service"
                />

                <Benefit
                  icon={<Check size={17} />}
                  text="Simple service journey"
                />

                <Benefit
                  icon={<Sparkles size={17} />}
                  text="Made for real everyday needs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-5 border-t border-white/15 pt-6">
              <p className="text-xs text-white/60">
                © {new Date().getFullYear()} FixIt
              </p>

              <Link
                to="/"
                className="text-xs font-medium text-white/75 transition hover:text-white"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================
            REGISTRATION PANEL
        ============================================================ */}

        <section className="flex min-h-screen items-center px-5 py-8 sm:px-8 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile brand */}

            <div className="mb-8 lg:hidden">
              <Link
                to="/"
                aria-label="FixIt home"
                className="inline-flex items-center"
              >
                <FixItLogo
                  variant="horizontal"
                  size="sm"
                  alt="FixIt"
                  className="h-7 w-auto max-w-[140px]"
                />
              </Link>
            </div>

            {!selectedRole ? (
              <RegisterRoleSelection
                onSelect={handleRoleSelect}
              />
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  className="mb-7 inline-flex min-h-9 items-center gap-2 rounded-[var(--fixit-radius-sm)] px-2 text-sm font-medium text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--fixit-primary-ring)]"
                >
                  <ArrowLeft size={16} />
                  Change account type
                </button>

                <div className="mb-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--fixit-radius-lg)] bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)]">
                    {selectedRole === "CUSTOMER" ? (
                      <Home size={22} />
                    ) : (
                      <BriefcaseBusiness size={22} />
                    )}
                  </div>

                  <p className="mb-2 text-sm font-semibold text-[var(--fixit-secondary)]">
                    {selectedRole === "CUSTOMER"
                      ? "Customer account"
                      : "Professional account"}
                  </p>

                  <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                    Create your account.
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-[var(--fixit-text-muted)]">
                    Start your FixIt journey with
                    a secure account.
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mb-5 rounded-[var(--fixit-radius-md)] border border-[var(--fixit-error)]/25 bg-[var(--fixit-error-soft)] px-4 py-3 text-sm leading-6 text-[var(--fixit-error)]"
                  >
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <Input
                    id="register-email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                    required
                  />

                  <Input
                    id="register-password"
                    label="Password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="At least 8 characters"
                    disabled={isSubmitting}
                    required
                    rightElement={
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (value) => !value,
                          )
                        }
                        className="rounded-lg p-1.5 text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fixit-primary-ring)]"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    }
                  />

                  <Input
                    id="register-confirm-password"
                    label="Confirm password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Re-enter your password"
                    disabled={isSubmitting}
                    required
                    rightElement={
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value,
                          )
                        }
                        className="rounded-lg p-1.5 text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fixit-primary-ring)]"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    }
                  />

                  <Card className="space-y-3 bg-[var(--fixit-background)] p-4">
                    <PasswordCheck
                      valid={passwordChecks.length}
                      text="At least 8 characters"
                    />

                    <PasswordCheck
                      valid={passwordChecks.matches}
                      text="Passwords match"
                    />
                  </Card>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    className="w-full"
                  >
                    Create account
                    <ArrowRight size={17} />
                  </Button>
                </form>

                <p className="mt-7 text-center text-xs leading-5 text-[var(--fixit-text-muted)]">
                  By creating an account, you agree
                  to FixIt's terms and privacy policy.
                </p>

                <p className="mt-5 text-center text-sm text-[var(--fixit-text-muted)]">
                  Already have an account?{" "}
                  <Link
                    to={`/login?role=${selectedRole.toLowerCase()}`}
                    className="font-semibold text-[var(--fixit-primary)] underline decoration-[var(--fixit-secondary)] decoration-2 underline-offset-4 transition hover:text-[var(--fixit-primary-hover)]"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function RegisterRoleSelection({
  onSelect,
}: {
  onSelect: (role: RegisterRole) => void;
}) {
  return (
    <div>
      <div className="mb-9">
        <div className="mb-5 flex h-12 w-12 items-center justify-center">
          <FixItLogo
            variant="icon"
            size="md"
            alt="FixIt"
            className="h-12 w-12"
          />
        </div>

        <p className="mb-2 text-sm font-semibold text-[var(--fixit-secondary)]">
          Join FixIt
        </p>

        <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
          How will you use FixIt?
        </h1>

        <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--fixit-text-muted)]">
          Choose an account type to get started.
        </p>
      </div>

      <div className="space-y-4">
        <AccountTypeCard
          icon={<Home size={23} />}
          eyebrow="CUSTOMER"
          title="I need a service"
          description="Find a professional for repairs, cleaning, installation, maintenance and more."
          onClick={() => onSelect("CUSTOMER")}
        />

        <AccountTypeCard
          icon={<BriefcaseBusiness size={23} />}
          eyebrow="PROFESSIONAL"
          title="I provide services"
          description="Build your profile, showcase your skills and connect with customers."
          onClick={() => onSelect("PROFESSIONAL")}
        />
      </div>

      <Card className="mt-8 border-[var(--fixit-primary)]/10 bg-[var(--fixit-primary-soft)] p-4">
        <div className="flex gap-3">
          <Sparkles
            size={18}
            className="mt-0.5 shrink-0 text-[var(--fixit-secondary)]"
          />

          <div>
            <p className="text-sm font-semibold">
              One FixIt. Two ways to use it.
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
              Customers find help. Professionals
              find opportunities.
            </p>
          </div>
        </div>
      </Card>

      <p className="mt-8 text-center text-sm text-[var(--fixit-text-muted)]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-[var(--fixit-primary)] underline decoration-[var(--fixit-secondary)] decoration-2 underline-offset-4 transition hover:text-[var(--fixit-primary-hover)]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

function AccountTypeCard({
  icon,
  eyebrow,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[118px] w-full items-start gap-4 rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-5 text-left shadow-[var(--fixit-shadow-sm)] transition duration-150 hover:-translate-y-0.5 hover:border-[var(--fixit-primary)]/25 hover:shadow-[var(--fixit-shadow-md)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--fixit-primary-ring)]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--fixit-radius-md)] bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)] transition-colors group-hover:bg-[var(--fixit-primary)] group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold tracking-[0.16em] text-[var(--fixit-secondary)]">
          {eyebrow}
        </p>

        <p className="mt-1 text-base font-bold">
          {title}
        </p>

        <p className="mt-1 text-sm leading-5 text-[var(--fixit-text-muted)]">
          {description}
        </p>
      </div>

      <ArrowRight
        size={18}
        className="mt-1 shrink-0 text-[var(--fixit-text-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--fixit-primary)]"
      />
    </button>
  );
}

function Benefit({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/75">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
        {icon}
      </div>

      <span>{text}</span>
    </div>
  );
}

function PasswordCheck({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={[
          "flex h-5 w-5 items-center justify-center rounded-full",
          valid
            ? "bg-[var(--fixit-success)] text-white"
            : "bg-[var(--fixit-disabled-soft)] text-[var(--fixit-disabled)]",
        ].join(" ")}
      >
        <Check size={12} />
      </div>

      <span
        className={
          valid
            ? "font-medium text-[var(--fixit-text)]"
            : "text-[var(--fixit-text-muted)]"
        }
      >
        {text}
      </span>
    </div>
  );
}

function normalizeRole(
  value: string | null,
): RegisterRole | null {
  if (value === "customer") {
    return "CUSTOMER";
  }

  if (value === "professional") {
    return "PROFESSIONAL";
  }

  return null;
}

function getRolePath(
  roles: UserRole[],
): string {
  if (roles.includes("ADMIN")) {
    return "/admin";
  }

  if (roles.includes("PROFESSIONAL")) {
    return "/professional";
  }

  return "/customer";
}

function getApiErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: unknown;
          };
        };
      }
    ).response;

    const detail = response?.data?.detail;

    if (typeof detail === "string" && detail) {
      return detail;
    }

    if (Array.isArray(detail)) {
      const firstMessage = detail.find(
        (item): item is { msg: string } =>
          typeof item === "object" &&
          item !== null &&
          "msg" in item &&
          typeof item.msg === "string",
      );

      if (firstMessage) {
        return firstMessage.msg;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to create your account. Please try again.";
}