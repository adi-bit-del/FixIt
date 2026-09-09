import {
  Check,
  Edit3,
  FolderTree,
  Plus,
  Power,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "./adminApi";

type CategoryFilter = "ALL" | "ACTIVE" | "INACTIVE";

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: string;
          };
        };
      }
    ).response;

    if (response?.data?.detail) {
      return response.data.detail;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<number | null>(
    null,
  );
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] =
    useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<CategoryFilter>("ALL");

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
  });

  const createMutation = useMutation({
    mutationFn: createAdminCategory,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-categories"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-services"],
      });

      setName("");
      setDescription("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        name?: string | null;
        description?: string | null;
        is_active?: boolean | null;
      };
    }) => updateAdminCategory(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-categories"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-services"],
      });

      setEditingId(null);
      setEditingName("");
      setEditingDescription("");
    },
  });

  const categories = categoriesQuery.data ?? [];

  const activeCount = categories.filter(
    (category) => category.is_active,
  ).length;

  const inactiveCount = categories.filter(
    (category) => !category.is_active,
  ).length;

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "ACTIVE" && category.is_active) ||
        (filter === "INACTIVE" && !category.is_active);

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        category.name,
        category.description ?? "",
        String(category.id),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [categories, filter, search]);

  const addCategory = () => {
    if (!name.trim()) {
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || null,
    });
  };

  const startEditing = (
    id: number,
    categoryName: string,
    categoryDescription: string | null,
  ) => {
    setEditingId(id);
    setEditingName(categoryName);
    setEditingDescription(categoryDescription ?? "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
    setEditingDescription("");
  };

  const saveCategory = (id: number) => {
    if (!editingName.trim()) {
      return;
    }

    updateMutation.mutate({
      id,
      data: {
        name: editingName.trim(),
        description: editingDescription.trim() || null,
      },
    });
  };

  const toggleCategory = (
    id: number,
    isActive: boolean,
  ) => {
    updateMutation.mutate({
      id,
      data: {
        is_active: !isActive,
      },
    });
  };

  const clearFilters = () => {
    setSearch("");
    setFilter("ALL");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <header className="mb-8">
        <p className="text-sm font-medium text-[var(--fixit-primary)]">
          Catalog
        </p>

        <div className="mt-1 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--fixit-text)] sm:text-3xl">
              Service Categories
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fixit-text-muted)] sm:text-base">
              Organize the FixIt service catalog and control which
              categories are available.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--fixit-text-muted)]">
            <FolderTree className="h-4 w-4" />
            <span>
              {categories.length} categor
              {categories.length === 1 ? "y" : "ies"}
            </span>
          </div>
        </div>
      </header>

      {/* Summary */}
      <section
        aria-label="Category summary"
        className="grid gap-3 sm:grid-cols-3"
      >
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={[
            "rounded-2xl border p-4 text-left shadow-sm transition",
            filter === "ALL"
              ? "border-[var(--fixit-primary-ring)] bg-[var(--fixit-primary-soft)]"
              : "border-[var(--fixit-border)] bg-white hover:border-[var(--fixit-primary-ring)]",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
            All categories
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
            {categoriesQuery.isLoading ? "—" : categories.length}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("ACTIVE")}
          className={[
            "rounded-2xl border p-4 text-left shadow-sm transition",
            filter === "ACTIVE"
              ? "border-emerald-200 bg-emerald-50"
              : "border-[var(--fixit-border)] bg-white hover:border-emerald-200",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
            Active
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
            {categoriesQuery.isLoading ? "—" : activeCount}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("INACTIVE")}
          className={[
            "rounded-2xl border p-4 text-left shadow-sm transition",
            filter === "INACTIVE"
              ? "border-slate-300 bg-slate-100"
              : "border-[var(--fixit-border)] bg-white hover:border-slate-300",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[var(--fixit-text-muted)]">
            Inactive / removed
          </p>

          <p className="mt-1 text-2xl font-bold text-[var(--fixit-text)]">
            {categoriesQuery.isLoading ? "—" : inactiveCount}
          </p>
        </button>
      </section>

      {/* Main content */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Create category */}
        <section className="h-fit rounded-2xl border border-[var(--fixit-border)] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--fixit-primary-soft)]">
              <Plus className="h-5 w-5 text-[var(--fixit-primary)]" />
            </div>

            <div>
              <h2 className="font-semibold text-[var(--fixit-text)]">
                Add category
              </h2>

              <p className="mt-1 text-sm leading-5 text-[var(--fixit-text-muted)]">
                Create a category for related FixIt services.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="category-name"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
              >
                Name
              </label>

              <input
                id="category-name"
                value={name}
                maxLength={100}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Electrical"
                className="w-full rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-disabled)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
              />
            </div>

            <div>
              <label
                htmlFor="category-description"
                className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
              >
                Description
              </label>

              <textarea
                id="category-description"
                value={description}
                maxLength={500}
                rows={5}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Electrical repair and installation services"
                className="w-full resize-none rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-disabled)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
              />
            </div>

            {createMutation.isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-[var(--fixit-danger)]">
                {getErrorMessage(createMutation.error)}
              </div>
            )}

            {createMutation.isSuccess && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-5 text-emerald-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Category created successfully.</span>
              </div>
            )}

            <button
              type="button"
              disabled={
                createMutation.isPending || !name.trim()
              }
              onClick={addCategory}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-3 text-sm font-semibold !text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-disabled)] disabled:!text-white"
            >
              <Plus className="h-4 w-4" />

              {createMutation.isPending
                ? "Creating..."
                : "Create category"}
            </button>
          </div>
        </section>

        {/* Categories */}
        <section className="min-w-0 rounded-2xl border border-[var(--fixit-border)] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--fixit-text)]">
                Categories
              </h2>

              <p className="mt-1 text-sm text-[var(--fixit-text-muted)]">
                {filteredCategories.length} of {categories.length}{" "}
                category
                {categories.length === 1 ? "" : "ies"}
              </p>
            </div>

            <div className="relative w-full lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fixit-text-muted)]" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search categories..."
                aria-label="Search categories"
                className="w-full rounded-xl border border-[var(--fixit-border)] bg-white py-2.5 pl-10 pr-3 text-sm text-[var(--fixit-text)] outline-none transition placeholder:text-[var(--fixit-disabled)] focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
              />
            </div>
          </div>

          {categoriesQuery.isLoading ? (
            <div className="mt-6 space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-[var(--fixit-border)] p-4"
                >
                  <div className="h-4 w-40 rounded bg-slate-100" />
                  <div className="mt-3 h-3 w-64 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : categoriesQuery.isError ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="font-semibold text-[var(--fixit-danger)]">
                Unable to load categories
              </p>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {getErrorMessage(categoriesQuery.error)}
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-[var(--fixit-border)] bg-[var(--fixit-background)] p-10 text-center">
              <FolderTree className="mx-auto h-10 w-10 text-[var(--fixit-disabled)]" />

              <p className="mt-4 font-semibold text-[var(--fixit-text)]">
                {categories.length === 0
                  ? "No categories yet"
                  : "No matching categories"}
              </p>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--fixit-text-muted)]">
                {categories.length === 0
                  ? "Create your first category to start organizing the FixIt service catalog."
                  : "Try another search term or clear the current filter."}
              </p>

              {categories.length > 0 &&
                (search || filter !== "ALL") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-[var(--fixit-primary-hover)]"
                  >
                    Clear filters
                  </button>
                )}
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {filteredCategories.map((category) => {
                const editing = editingId === category.id;
                const updating =
                  updateMutation.isPending &&
                  updateMutation.variables?.id === category.id;

                return (
                  <article
                    key={category.id}
                    className={[
                      "rounded-xl border p-4 transition",
                      category.is_active
                        ? "border-[var(--fixit-border)] bg-white"
                        : "border-slate-200 bg-slate-50/70",
                    ].join(" ")}
                  >
                    {!editing ? (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-[var(--fixit-text)]">
                              {category.name}
                            </p>

                            <span
                              className={[
                                "rounded-full px-2.5 py-1 text-xs font-semibold",
                                category.is_active
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-200 text-slate-600",
                              ].join(" ")}
                            >
                              {category.is_active
                                ? "Active"
                                : "Removed"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm leading-6 text-[var(--fixit-text-muted)]">
                            {category.description ||
                              "No description"}
                          </p>

                          <p className="mt-2 text-xs text-[var(--fixit-disabled)]">
                            Category #{category.id}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                category.id,
                                category.name,
                                category.description,
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm font-semibold text-[var(--fixit-text-muted)] transition hover:border-[var(--fixit-primary-ring)] hover:bg-[var(--fixit-primary-soft)] hover:text-[var(--fixit-primary)]"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              Edit
                            </span>
                          </button>

                          <button
                            type="button"
                            disabled={updating}
                            onClick={() =>
                              toggleCategory(
                                category.id,
                                category.is_active,
                              )
                            }
                            className={
                              category.is_active
                                ? "inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm font-semibold text-[var(--fixit-danger)] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-[var(--fixit-border)] disabled:text-[var(--fixit-disabled)]"
                                : "inline-flex items-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-3 py-2.5 text-sm font-semibold text-[var(--fixit-primary)] transition hover:border-[var(--fixit-primary-ring)] hover:bg-[var(--fixit-primary-soft)] disabled:cursor-not-allowed disabled:text-[var(--fixit-disabled)]"
                            }
                          >
                            {category.is_active ? (
                              <>
                                <Power className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                  {updating
                                    ? "Removing..."
                                    : "Remove"}
                                </span>
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                  {updating
                                    ? "Restoring..."
                                    : "Restore"}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor={`category-name-${category.id}`}
                            className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
                          >
                            Category name
                          </label>

                          <input
                            id={`category-name-${category.id}`}
                            value={editingName}
                            maxLength={100}
                            onChange={(event) =>
                              setEditingName(
                                event.target.value,
                              )
                            }
                            className="w-full rounded-xl border border-[var(--fixit-border)] px-3 py-2.5 text-sm text-[var(--fixit-text)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`category-description-${category.id}`}
                            className="mb-1.5 block text-sm font-medium text-[var(--fixit-text)]"
                          >
                            Description
                          </label>

                          <textarea
                            id={`category-description-${category.id}`}
                            value={editingDescription}
                            maxLength={500}
                            rows={4}
                            onChange={(event) =>
                              setEditingDescription(
                                event.target.value,
                              )
                            }
                            className="w-full resize-none rounded-xl border border-[var(--fixit-border)] px-3 py-2.5 text-sm text-[var(--fixit-text)] outline-none transition focus:border-[var(--fixit-primary)] focus:ring-4 focus:ring-[var(--fixit-primary-ring)]"
                          />
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--fixit-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--fixit-text-muted)] transition hover:bg-[var(--fixit-background)] hover:text-[var(--fixit-text)]"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>

                          <button
                            type="button"
                            disabled={
                              updateMutation.isPending ||
                              !editingName.trim()
                            }
                            onClick={() =>
                              saveCategory(category.id)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--fixit-primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-[var(--fixit-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--fixit-disabled)] disabled:!text-white"
                          >
                            <Check className="h-4 w-4" />
                            {updateMutation.isPending
                              ? "Saving..."
                              : "Save changes"}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {updateMutation.isError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-[var(--fixit-danger)]">
              {getErrorMessage(updateMutation.error)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}