import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../../components/ui/Button";
import FixItLogo from "../../components/FixItLogo";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--fixit-background)] text-[var(--fixit-text)]">
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <section className="flex flex-1 items-center justify-center px-5 py-16 sm:px-8 lg:px-12">
          <div className="w-full max-w-3xl text-center">
            {/* Brand mark */}

            <div className="mx-auto flex h-14 w-14 items-center justify-center">
              <FixItLogo
                variant="icon"
                size="lg"
                alt="FixIt"
                className="h-14 w-14"
              />
            </div>

            <p className="mt-7 text-xs font-bold tracking-[0.18em] text-[var(--fixit-secondary)]">
              WELCOME TO FIXIT
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Get the right help.
              <span className="block text-[var(--fixit-primary)]">
                Get it fixed.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[var(--fixit-text-muted)] sm:text-base sm:leading-7">
              FixIt connects people with professionals
              for everyday home services, repairs and
              maintenance.
            </p>

            <div className="mx-auto mt-9 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="flex-1"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Login
                  <ArrowRight size={17} />
                </Button>
              </Link>

              <Link
                to="/register"
                className="flex-1"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  Register
                </Button>
              </Link>
            </div>

            <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-[var(--fixit-text-muted)]">
              <span>Home services</span>

              <span className="h-1 w-1 rounded-full bg-[var(--fixit-border)]" />

              <span>Trusted professionals</span>

              <span className="h-1 w-1 rounded-full bg-[var(--fixit-border)]" />

              <span>Simple service journey</span>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}

function Navbar() {
  return (
    <header className="border-b border-[var(--fixit-border)] bg-[var(--fixit-surface)]">
      <div className="fixit-container">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            aria-label="FixIt home"
            className="flex items-center"
          >
            <FixItLogo
              variant="horizontal"
              size="sm"
              alt="FixIt"
              className="h-7 w-auto max-w-[140px]"
            />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-[var(--fixit-radius-md)] px-3 py-2 text-sm font-semibold text-[var(--fixit-text)] transition hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)]"
            >
              Login
            </Link>

            <Link to="/register">
              <Button
                variant="primary"
                size="sm"
              >
                Register
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--fixit-border)] bg-[var(--fixit-surface)]">
      <div className="fixit-container flex flex-col gap-2 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <Link
          to="/"
          aria-label="FixIt home"
          className="inline-flex items-center"
        >
          <FixItLogo
            variant="horizontal"
            size="xs"
            alt="FixIt"
            className="h-6 w-auto max-w-[110px]"
          />
        </Link>

        <p className="text-xs text-[var(--fixit-text-muted)]">
          © {new Date().getFullYear()} FixIt. Built for better everyday service.
        </p>
      </div>
    </footer>
  );
}