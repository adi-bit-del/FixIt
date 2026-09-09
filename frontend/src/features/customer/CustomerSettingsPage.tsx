import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Check,
  Monitor,
  Moon,
  Save,
  SlidersHorizontal,
  Sun,
} from "lucide-react";


/*
|--------------------------------------------------------------------------
| Customer Settings Page
|--------------------------------------------------------------------------
|
| There is currently no customer settings API exposed by the backend.
|
| Preferences are therefore stored locally in the browser.
|
| IMPORTANT:
| The application currently uses the FixIt light design system.
| Theme selection is stored as a preference, but dark mode is not
| applied globally until the application's complete dark token system
| is implemented.
|
|--------------------------------------------------------------------------
*/


type ThemePreference =
  | "system"
  | "light"
  | "dark";


const STORAGE_KEY =
  "fixit.customer.settings";


interface SettingsState {
  theme: ThemePreference;
  compactLayout: boolean;
}


const DEFAULT_SETTINGS: SettingsState = {
  theme: "system",
  compactLayout: false,
};


/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function CustomerSettingsPage() {
  const [
    settings,
    setSettings,
  ] = useState<SettingsState>(
    DEFAULT_SETTINGS,
  );


  const [
    saved,
    setSaved,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Load local preferences
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          STORAGE_KEY,
        );


      if (!stored) {
        return;
      }


      const parsed =
        JSON.parse(
          stored,
        ) as Partial<SettingsState>;


      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsed,
      });

    } catch {
      setSettings(
        DEFAULT_SETTINGS,
      );
    }
  }, []);


  /*
  |--------------------------------------------------------------------------
  | Save preferences
  |--------------------------------------------------------------------------
  */

  function handleSave() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          settings,
        ),
      );

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);

    } catch {
      setSaved(false);
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Update helper
  |--------------------------------------------------------------------------
  */

  function updateSettings(
    partial: Partial<SettingsState>,
  ) {
    setSettings(
      (current) => ({
        ...current,
        ...partial,
      }),
    );

    setSaved(false);
  }


  return (
    <div className="space-y-7">


      {/* ================================================================
          HERO
          ================================================================ */}

      <section className="relative overflow-hidden rounded-[28px] bg-[var(--fixit-primary-active)] px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10 lg:px-10">

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--fixit-secondary)] opacity-20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-[var(--fixit-primary-hover)] opacity-20 blur-3xl" />


        <div className="relative max-w-3xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">

            <SlidersHorizontal
              size={13}
            />

            <span>
              Settings
            </span>

          </div>


          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Make FixIt feel
            <span className="block text-[var(--fixit-secondary)]">
              like yours.
            </span>
          </h1>


          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            Adjust the workspace preferences
            available on this device.
          </p>

        </div>

      </section>


      {/* ================================================================
          LOCAL SETTINGS NOTICE
          ================================================================ */}

      <section className="rounded-[24px] border border-[var(--fixit-primary)]/15 bg-[var(--fixit-primary-soft)] px-5 py-4 sm:px-6">

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--fixit-primary)] shadow-sm">

            <SlidersHorizontal
              size={17}
            />

          </div>


          <div>

            <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
              Saved on this device
            </p>


            <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
              These preferences are stored in this
              browser because the current FixIt
              backend does not provide a customer
              settings endpoint.
            </p>

          </div>

        </div>

      </section>


      {/* ================================================================
          APPEARANCE
          ================================================================ */}

      <section className="rounded-[26px] border border-[var(--fixit-border)] bg-white shadow-sm">

        <div className="p-5 sm:p-6 lg:p-7">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
              Appearance
            </p>


            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
              Theme preference
            </h2>


            <p className="mt-2 text-sm leading-6 text-[var(--fixit-text-muted)]">
              Choose your preferred appearance
              setting for future FixIt theme support.
            </p>

          </div>


          <div className="mt-6 grid gap-3 sm:grid-cols-3">

            <ThemeOption
              value="system"
              label="System"
              description="Follow your device"
              icon={
                <Monitor
                  size={18}
                />
              }
              selected={
                settings.theme ===
                "system"
              }
              available
              onSelect={() =>
                updateSettings({
                  theme: "system",
                })
              }
            />


            <ThemeOption
              value="light"
              label="Light"
              description="Use the FixIt light theme"
              icon={
                <Sun
                  size={18}
                />
              }
              selected={
                settings.theme ===
                "light"
              }
              available
              onSelect={() =>
                updateSettings({
                  theme: "light",
                })
              }
            />


            <ThemeOption
              value="dark"
              label="Dark"
              description="Coming with dark theme support"
              icon={
                <Moon
                  size={18}
                />
              }
              selected={
                settings.theme ===
                "dark"
              }
              available={false}
              onSelect={() =>
                updateSettings({
                  theme: "dark",
                })
              }
            />

          </div>


          {settings.theme ===
            "dark" && (

            <div className="mt-5 rounded-2xl border border-[var(--fixit-warning)]/20 bg-[var(--fixit-warning-soft)] px-4 py-3">

              <p className="text-xs font-semibold text-[var(--fixit-warning)]">
                Dark mode is saved as a preference
                but is not enabled yet.
              </p>


              <p className="mt-1 text-xs leading-5 text-[var(--fixit-text-muted)]">
                The current FixIt workspace is
                optimized for the light theme. Dark
                mode will be enabled after the
                complete application-wide theme
                system is ready.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* ================================================================
          WORKSPACE
          ================================================================ */}

      <section className="rounded-[26px] border border-[var(--fixit-border)] bg-white shadow-sm">

        <div className="p-5 sm:p-6 lg:p-7">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fixit-text-muted)]">
              Workspace
            </p>


            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fixit-text-dark)]">
              Layout preferences
            </h2>


            <p className="mt-2 text-sm leading-6 text-[var(--fixit-text-muted)]">
              Control how much spacing your
              workspace should use where supported.
            </p>

          </div>


          {/* Compact layout */}

          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[var(--fixit-border)] bg-[var(--fixit-background)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--fixit-primary)] shadow-sm">

                  <SlidersHorizontal
                    size={16}
                  />

                </div>


                <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
                  Compact layout
                </p>

              </div>


              <p className="mt-2 max-w-xl text-xs leading-5 text-[var(--fixit-text-muted)]">
                Reduce spacing between sections
                where supported by the FixIt
                workspace.
              </p>

            </div>


            <button
              type="button"
              role="switch"
              aria-checked={
                settings.compactLayout
              }
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


          {/* Current preference */}

          <div className="mt-4 flex items-center gap-2 text-xs text-[var(--fixit-text-muted)]">

            <Check
              size={14}
              className="text-[var(--fixit-primary)]"
            />

            <span>
              {settings.compactLayout
                ? "Compact spacing is selected."
                : "Standard spacing is selected."}
            </span>

          </div>

        </div>

      </section>


      {/* ================================================================
          SAVE
          ================================================================ */}

      <div className="flex flex-col gap-3 border-t border-[var(--fixit-border)] pt-5 sm:flex-row sm:items-center sm:justify-end">

        {saved && (

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--fixit-success)]">

            <Check
              size={15}
            />

            Preferences saved

          </div>

        )}


        <button
          type="button"
          onClick={
            handleSave
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fixit-primary-hover)]"
        >

          <Save
            size={16}
          />

          <span>
            Save preferences
          </span>

        </button>

      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Theme Option
|--------------------------------------------------------------------------
*/

function ThemeOption({
  value,
  label,
  description,
  icon,
  selected,
  available,
  onSelect,
}: {
  value: ThemePreference;
  label: string;
  description: string;
  icon: ReactNode;
  selected: boolean;
  available: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={
        selected
      }
      disabled={
        !available
      }
      onClick={
        onSelect
      }
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

            <Check
              size={14}
            />

          </div>

        )}

      </div>


      <div>

        <div className="flex items-center gap-2">

          <p className="text-sm font-semibold text-[var(--fixit-text-dark)]">
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


      <span className="sr-only">
        {value}
      </span>

    </button>
  );
}