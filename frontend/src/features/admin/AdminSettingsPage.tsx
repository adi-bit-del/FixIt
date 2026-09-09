import {
  Check,
  Monitor,
  Save,
  Settings,
  Sun,
  Moon,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";

type ThemePreference =
  | "system"
  | "light"
  | "dark";

interface AdminSettingsState {
  theme: ThemePreference;
  compactLayout: boolean;
}

const STORAGE_KEY = "fixit.admin.settings";

const DEFAULT_SETTINGS: AdminSettingsState = {
  theme: "system",
  compactLayout: false,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] =
    useState<AdminSettingsState>(
      DEFAULT_SETTINGS,
    );

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        STORAGE_KEY,
      );

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(
        stored,
      ) as Partial<AdminSettingsState>;

      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsed,
      });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  function updateSettings(
    partial: Partial<AdminSettingsState>,
  ) {
    setSettings((current) => ({
      ...current,
      ...partial,
    }));

    setSaved(false);
  }

  function handleSave() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings),
      );

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch {
      setSaved(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}

      <header className="mb-8">
        <p className="text-sm font-medium text-[var(--fixit-primary)]">
          Account
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--fixit-text)] sm:text-3xl">
          Admin Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)] sm:text-base">
          Manage workspace preferences for the FixIt admin
          console.
        </p>
      </header>

      <div className="space-y-6">
        {/* Local settings notice */}

        <section className="rounded-2xl border border-[var(--fixit-primary)]/15 bg-[var(--fixit-primary-soft)] px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--fixit-primary)] shadow-sm">
              <Settings size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--fixit-text)]">
                Saved on this device
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                These workspace preferences are stored locally in
                this browser because the current FixIt backend does
                not provide an admin settings endpoint.
              </p>
            </div>
          </div>
        </section>

        {/* Appearance */}

        <section className="rounded-2xl border border-[var(--fixit-border)] bg-white shadow-sm">
          <div className="p-5 sm:p-6 lg:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
                Appearance
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text)]">
                Theme preference
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--fixit-text-muted)]">
                Choose the appearance preference for this admin
                workspace.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ThemeOption
                label="System"
                description="Follow your device preference"
                icon={<Monitor size={18} />}
                selected={settings.theme === "system"}
                available
                onSelect={() =>
                  updateSettings({
                    theme: "system",
                  })
                }
              />

              <ThemeOption
                label="Light"
                description="Use the current FixIt light theme"
                icon={<Sun size={18} />}
                selected={settings.theme === "light"}
                available
                onSelect={() =>
                  updateSettings({
                    theme: "light",
                  })
                }
              />

              <ThemeOption
                label="Dark"
                description="Available after dark theme support"
                icon={<Moon size={18} />}
                selected={false}
                available={false}
                onSelect={() => undefined}
              />
            </div>

            {settings.theme === "system" && (
              <div className="mt-5 rounded-xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] px-4 py-3">
                <p className="text-xs leading-5 text-[var(--fixit-text-muted)]">
                  The FixIt admin console currently uses the light
                  design system regardless of the device theme.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Workspace */}

        <section className="rounded-2xl border border-[var(--fixit-border)] bg-white shadow-sm">
          <div className="p-5 sm:p-6 lg:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
                Workspace
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text)]">
                Layout preferences
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--fixit-text-muted)]">
                Configure workspace preferences that can be
                supported by the admin console.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--fixit-primary)] shadow-sm">
                    <SlidersHorizontal size={16} />
                  </div>

                  <p className="text-sm font-semibold text-[var(--fixit-text)]">
                    Compact layout
                  </p>
                </div>

                <p className="mt-2 max-w-xl text-xs leading-5 text-[var(--fixit-text-muted)]">
                  Save a preference for reduced spacing where
                  compact workspace support is introduced.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={settings.compactLayout}
                aria-label="Toggle compact layout"
                onClick={() =>
                  updateSettings({
                    compactLayout:
                      !settings.compactLayout,
                  })
                }
                className={[
                  "relative h-7 w-12 shrink-0 rounded-full transition",
                  settings.compactLayout
                    ? "bg-[var(--fixit-primary)]"
                    : "bg-[var(--fixit-disabled)]",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition",
                    settings.compactLayout
                      ? "left-6"
                      : "left-1",
                  ].join(" ")}
                />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--fixit-text-muted)]">
              <Check
                size={14}
                className="text-[var(--fixit-primary)]"
              />

              <span>
                {settings.compactLayout
                  ? "Compact layout is selected."
                  : "Standard layout is selected."}
              </span>
            </div>
          </div>
        </section>

        {/* Admin environment */}

        <section className="rounded-2xl border border-[var(--fixit-border)] bg-white shadow-sm">
          <div className="p-5 sm:p-6 lg:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
                <Settings
                  size={17}
                  className="text-[var(--fixit-primary)]"
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[var(--fixit-text)]">
                  Admin workspace
                </h2>

                <p className="mt-1 text-sm leading-6 text-[var(--fixit-text-muted)]">
                  Platform management controls are handled through
                  the individual Admin modules. Global platform
                  configuration is not exposed here because the
                  current backend does not provide those settings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Save */}

        <div className="flex flex-col gap-3 border-t border-[var(--fixit-border)] pt-5 sm:flex-row sm:items-center sm:justify-end">
          {saved && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--fixit-success)]">
              <Check size={15} />
              Preferences saved
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fixit-primary-hover)]"
          >
            <Save size={16} />
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemeOption({
  label,
  description,
  icon,
  selected,
  available,
  onSelect,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  available: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={!available}
      onClick={onSelect}
      className={[
        "relative flex min-w-0 flex-col gap-3 rounded-2xl border p-4 text-left transition",
        !available
          ? "cursor-not-allowed border-[var(--fixit-border)] bg-[var(--fixit-background)] opacity-60"
          : selected
            ? "border-[var(--fixit-primary)] bg-[var(--fixit-primary-soft)] shadow-sm"
            : "border-[var(--fixit-border)] bg-white hover:border-[var(--fixit-primary)]/40 hover:bg-[var(--fixit-background)]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl",
            !available
              ? "bg-white text-[var(--fixit-disabled)]"
              : selected
                ? "bg-[var(--fixit-primary)] text-white"
                : "bg-[var(--fixit-background)] text-[var(--fixit-text-muted)]",
          ].join(" ")}
        >
          {icon}
        </div>

        {selected && available && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--fixit-primary)] text-white">
            <Check size={14} />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[var(--fixit-text)]">
            {label}
          </p>

          {!available && (
            <span className="rounded-full bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--fixit-text-muted)]">
              Soon
            </span>
          )}
        </div>

        <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
          {description}
        </p>
      </div>
    </button>
  );
}