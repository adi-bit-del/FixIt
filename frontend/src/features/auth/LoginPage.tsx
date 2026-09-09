import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  Home,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import FixItLogo from "../../components/FixItLogo";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "./AuthContext";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

import type { UserRole } from "../../types/auth";

type LoginRole = "CUSTOMER" | "PROFESSIONAL";

interface LoginLocationState {
  from?: {
    pathname?: string;
    search?: string;
  };
  registrationComplete?: boolean;
  registeredEmail?: string;
}

export default function LoginPage() {
  const {
    user,
    isLoading: authLoading,
    login,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();

  const locationState =
    location.state as LoginLocationState | null;

  const roleFromUrl = normalizeRole(
    searchParams.get("role")
  );

  const [selectedRole, setSelectedRole] =
    useState<LoginRole | null>(roleFromUrl);

  const [email, setEmail] = useState(
    locationState?.registeredEmail ?? ""
  );

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [registrationMessage, setRegistrationMessage] =
    useState("");

  useEffect(() => {
    const role = normalizeRole(
      searchParams.get("role")
    );

    setSelectedRole(role);
  }, [searchParams]);

  useEffect(() => {
    if (!locationState?.registrationComplete) {
      return;
    }

    setRegistrationMessage(
      "Account created successfully. Please sign in to continue."
    );

    navigate(
      {
        pathname: location.pathname,
        search: location.search,
      },
      {
        replace: true,
        state: null,
      }
    );
  }, [
    location.pathname,
    location.search,
    locationState?.registrationComplete,
    navigate,
  ]);

  if (!authLoading && user) {
    return (
      <Navigate
        to={getRolePath(user.roles)}
        replace
      />
    );
  }

  const selectedRoleLabel = useMemo(() => {
    if (selectedRole === "PROFESSIONAL") {
      return "Professional account";
    }

    return "Customer account";
  }, [selectedRole]);

  function handleRoleSelect(
    role: LoginRole
  ) {
    setSelectedRole(role);
    setError("");

    navigate(
      {
        pathname: "/login",
        search: `?role=${role.toLowerCase()}`,
      },
      {
        replace: true,
        state: locationState,
      }
    );
  }

  function handleBack() {
    setSelectedRole(null);
    setError("");
    setPassword("");

    navigate(
      {
        pathname: "/login",
      },
      {
        replace: true,
        state: locationState?.registrationComplete
          ? {
              registrationComplete:
                locationState.registrationComplete,
              registeredEmail:
                locationState.registeredEmail,
            }
          : null,
      }
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    if (!selectedRole) {
      setError(
        "Please select an account type."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const authenticatedUser =
        await login(
          normalizedEmail,
          password
        );

      const hasSelectedRole =
        authenticatedUser.roles.includes(
          selectedRole
        );

      if (!hasSelectedRole) {
        setError(
          `This account is not registered as a ${selectedRoleLabel.toLowerCase()}. Please choose the correct account type.`
        );

        return;
      }

      const requestedPath =
        locationState?.from?.pathname;

      const requestedSearch =
        locationState?.from?.search ?? "";

      const defaultPath =
  selectedRole === "PROFESSIONAL"
    ? "/professional"
    : "/customer";

      const destination =
        requestedPath &&
        isPathAllowedForRole(
          requestedPath,
          selectedRole
        )
          ? `${requestedPath}${requestedSearch}`
          : defaultPath;

      navigate(destination, {
        replace: true,
      });
    } catch (error: unknown) {
      setError(
        getLoginErrorMessage(error)
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEmailChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setPassword(event.target.value);
  }

  return (
    <main className="min-h-screen bg-[var(--fixit-background)] text-[var(--fixit-text)]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ============================================================
            BRAND PANEL
        ============================================================ */}

        <section className="relative hidden overflow-hidden bg-[var(--fixit-primary-active)] lg:flex">
          <div className="absolute -right-28 top-12 h-80 w-80 rounded-full bg-[var(--fixit-secondary)]/20 blur-3xl" />

          <div className="absolute -left-28 bottom-0 h-80 w-80 rounded-full bg-[var(--fixit-primary-hover)]/20 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
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
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white">
                <Sparkles size={14} />
                Welcome back to FixIt
              </div>

              <h1 className="text-5xl font-bold leading-[1.03] tracking-[-0.05em] text-white xl:text-6xl">
                Get the right help.
                <span className="block text-white/70">
                  Get it fixed.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/75 xl:text-lg">
                Access your FixIt account and continue
                your service journey from one place.
              </p>

              <div className="mt-9 space-y-3">
                <Benefit
                  icon={<ShieldCheck size={17} />}
                  text="Trusted service experience"
                />

                <Benefit
                  icon={<CheckCircle2 size={17} />}
                  text="Simple service management"
                />

                <Benefit
                  icon={<Sparkles size={17} />}
                  text="Built for customers and professionals"
                />
              </div>
            </div>

            <p className="text-xs text-white/50">
              FixIt • Home & local services
            </p>
          </div>
        </section>

        {/* ============================================================
            LOGIN PANEL
        ============================================================ */}

        <section className="flex min-h-screen items-center px-5 py-10 sm:px-8 lg:px-14">
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
              <RoleSelection
                onSelect={handleRoleSelect}
                registrationMessage={
                  registrationMessage
                }
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
                    {selectedRoleLabel}
                  </p>

                  <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                    Sign in to FixIt.
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-[var(--fixit-text-muted)]">
                    Enter your account details to
                    continue.
                  </p>
                </div>

                {registrationMessage && (
                  <div
                    role="status"
                    className="mb-5 flex items-start gap-3 rounded-[var(--fixit-radius-md)] border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] px-4 py-3 text-sm leading-6 text-[var(--fixit-text)]"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--fixit-success)]"
                    />

                    <p>{registrationMessage}</p>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="mb-5 rounded-[var(--fixit-radius-md)] border border-[var(--fixit-error)]/25 bg-[var(--fixit-error-soft)] px-4 py-3 text-sm leading-6 text-[var(--fixit-error)]"
                  >
                    {error}
                  </div>
                )}

                <Card className="p-5 sm:p-6">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <Input
                      id="login-email"
                      label="Email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="you@example.com"
                      disabled={isSubmitting}
                      required
                    />

                    <Input
                      id="login-password"
                      label="Password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                      required
                      rightElement={
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (value) => !value
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

                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 text-sm text-[var(--fixit-text-muted)]">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[var(--fixit-border)] accent-[var(--fixit-primary)]"
                        />

                        Remember me
                      </label>

                      <Link
  to="/forgot-password"
  className="text-sm font-medium text-[var(--fixit-primary)] transition hover:text-[var(--fixit-primary-hover)]"
>
  Forgot password?
</Link>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={isSubmitting}
                      className="w-full"
                    >
                      Sign in

                      {!isSubmitting && (
                        <ArrowRight size={17} />
                      )}
                    </Button>
                  </form>
                </Card>

                <div className="mt-6 text-center">
                  <p className="text-sm text-[var(--fixit-text-muted)]">
                    Don't have a FixIt account?
                  </p>

                  <Link
                    to={`/register?role=${selectedRole.toLowerCase()}`}
                    className="mt-2 inline-flex font-semibold text-[var(--fixit-primary)] underline decoration-[var(--fixit-secondary)] decoration-2 underline-offset-4 transition hover:text-[var(--fixit-primary-hover)]"
                  >
                    Create a {selectedRole === "CUSTOMER"
                      ? "customer"
                      : "professional"} account
                  </Link>
                </div>

                <p className="mt-6 text-center text-xs leading-5 text-[var(--fixit-text-muted)]">
                  By continuing, you agree to FixIt's
                  terms of service and privacy policy.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function RoleSelection({
  onSelect,
  registrationMessage,
}: {
  onSelect: (role: LoginRole) => void;
  registrationMessage: string;
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
          Welcome to FixIt
        </p>

        <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
          How do you want to sign in?
        </h1>

        <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--fixit-text-muted)]">
          Choose your account type to continue.
        </p>
      </div>

      {registrationMessage && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-[var(--fixit-radius-md)] border border-[var(--fixit-success)]/20 bg-[var(--fixit-success-soft)] px-4 py-3 text-sm leading-6 text-[var(--fixit-text)]"
        >
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-[var(--fixit-success)]"
          />

          <p>{registrationMessage}</p>
        </div>
      )}

      <div className="space-y-4">
        <AccountTypeCard
          icon={<Home size={23} />}
          eyebrow="CUSTOMER"
          title="I need a service"
          description="Find professionals, request services and manage your bookings."
          onClick={() => onSelect("CUSTOMER")}
        />

        <AccountTypeCard
          icon={<BriefcaseBusiness size={23} />}
          eyebrow="PROFESSIONAL"
          title="I provide services"
          description="Manage your services, requests, quotes and bookings."
          onClick={() =>
            onSelect("PROFESSIONAL")
          }
          accent="secondary"
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
              One FixIt. Two experiences.
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
              Customers find help. Professionals
              manage their work.
            </p>
          </div>
        </div>
      </Card>

      <p className="mt-8 text-center text-sm text-[var(--fixit-text-muted)]">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-[var(--fixit-primary)] underline decoration-[var(--fixit-secondary)] decoration-2 underline-offset-4 transition hover:text-[var(--fixit-primary-hover)]"
        >
          Register
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
  accent = "primary",
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  onClick: () => void;
  accent?: "primary" | "secondary";
}) {
  const isSecondary = accent === "secondary";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[126px] w-full items-start gap-4 rounded-[var(--fixit-radius-xl)] border border-[var(--fixit-border)] bg-[var(--fixit-surface)] p-5 text-left shadow-[var(--fixit-shadow-sm)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[var(--fixit-shadow-md)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--fixit-primary-ring)]"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--fixit-radius-md)] transition-colors ${
          isSecondary
            ? "bg-[var(--fixit-secondary-soft)] text-[var(--fixit-secondary)] group-hover:bg-[var(--fixit-secondary)] group-hover:text-white"
            : "bg-[var(--fixit-primary-soft)] text-[var(--fixit-primary)] group-hover:bg-[var(--fixit-primary)] group-hover:text-white"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-[10px] font-bold tracking-[0.16em] ${
            isSecondary
              ? "text-[var(--fixit-secondary)]"
              : "text-[var(--fixit-primary)]"
          }`}
        >
          {eyebrow}
        </p>

        <p className="mt-1 text-base font-bold text-[var(--fixit-text)]">
          {title}
        </p>

        <p className="mt-1 max-w-sm text-sm leading-5 text-[var(--fixit-text-muted)]">
          {description}
        </p>
      </div>

      <ArrowRight
        size={18}
        className={`mt-1 shrink-0 text-[var(--fixit-text-muted)] transition ${
          isSecondary
            ? "group-hover:translate-x-1 group-hover:text-[var(--fixit-secondary)]"
            : "group-hover:translate-x-1 group-hover:text-[var(--fixit-primary)]"
        }`}
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

function normalizeRole(
  value: string | null
): LoginRole | null {
  if (value === "customer") {
    return "CUSTOMER";
  }

  if (value === "professional") {
    return "PROFESSIONAL";
  }

  return null;
}

function getRolePath(
  roles: UserRole[]
): string {
  if (roles.includes("ADMIN")) {
    return "/admin";
  }

  if (roles.includes("PROFESSIONAL")) {
    return "/professional";
  }

  return "/customer";
}

function isPathAllowedForRole(
  path: string,
  role: LoginRole
): boolean {
  if (role === "CUSTOMER") {
    return path === "/customer" ||
      path.startsWith("/customer/");
  }

  return (
    path === "/professional" ||
    path.startsWith("/professional/")
  );
}

function getLoginErrorMessage(
  error: unknown
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

    if (
      typeof detail === "string" &&
      detail
    ) {
      return detail;
    }

    if (Array.isArray(detail)) {
      const firstMessage = detail.find(
        (
          item
        ): item is { msg: string } =>
          typeof item === "object" &&
          item !== null &&
          "msg" in item &&
          typeof item.msg === "string"
      );

      if (firstMessage) {
        return firstMessage.msg;
      }
    }
  }

  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return "Unable to sign in. Please check your credentials and try again.";
}