import Link from "next/link";
import StorefrontProductCard from "@/components/StorefrontProductCard";
import {
  type CatalogSortOption,
  getStorefrontCatalog,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

type CatalogPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    size?: string;
    color?: string;
    gender?: "men" | "women" | "unisex";
    sort?: CatalogSortOption;
    page?: string;
  }>;
};

function createCatalogHref(
  currentSearchParams: Record<string, string | undefined>,
  updates: Record<string, string | undefined>
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries({ ...currentSearchParams, ...updates })) {
    if (value) {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  return queryString ? `/catalog?${queryString}` : "/catalog";
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const resolvedSearchParams = await searchParams;
  const currentQuery = resolvedSearchParams.q?.trim() ?? "";
  const currentCategory = resolvedSearchParams.category?.trim() ?? "";
  const currentSize = resolvedSearchParams.size?.trim() ?? "";
  const currentColor = resolvedSearchParams.color?.trim() ?? "";
  const currentGender = resolvedSearchParams.gender?.trim() ?? "";
  const currentSort = resolvedSearchParams.sort ?? "latest";
  const currentPage = Number(resolvedSearchParams.page ?? "1") || 1;

  const {
    products,
    categories,
    totalProducts,
    totalPages,
    currentPage: page,
    availableSizes,
    availableColors,
    usesFallback,
  } = await getStorefrontCatalog({
    query: currentQuery,
    category: currentCategory,
    size: currentSize,
    color: currentColor,
    gender: currentGender as "men" | "women" | "unisex" | "",
    sort: currentSort,
    page: currentPage,
    pageSize: 9,
  });

  const baseParams = {
    q: currentQuery || undefined,
    category: currentCategory || undefined,
    size: currentSize || undefined,
    color: currentColor || undefined,
    gender: currentGender || undefined,
    sort: currentSort || undefined,
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_30%,_#f3f4f6_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
            Product Catalog
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950">
                Browse the full collection
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Explore products by category, search by keyword, narrow by size or color,
                then sort and page through the catalog.
              </p>
            </div>
            <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              {totalProducts} products
            </div>
          </div>
        </section>

        {usesFallback ? (
          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Demo catalog is showing until store products are added in the admin dashboard.
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[0.28fr_0.72fr]">
          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Search and Filter
            </p>

            <form className="mt-5 space-y-5" action="/catalog">
              <div>
                <label htmlFor="q" className="text-sm font-semibold text-slate-800">
                  Search
                </label>
                <input
                  id="q"
                  name="q"
                  defaultValue={currentQuery}
                  placeholder="Search products"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div>
                <label htmlFor="category" className="text-sm font-semibold text-slate-800">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue={currentCategory}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="size" className="text-sm font-semibold text-slate-800">
                  Size
                </label>
                <select
                  id="size"
                  name="size"
                  defaultValue={currentSize}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                >
                  <option value="">All sizes</option>
                  {availableSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="color" className="text-sm font-semibold text-slate-800">
                  Color
                </label>
                <select
                  id="color"
                  name="color"
                  defaultValue={currentColor}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                >
                  <option value="">All colors</option>
                  {availableColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="gender" className="text-sm font-semibold text-slate-800">
                  For
                </label>
                <select
                  id="gender"
                  name="gender"
                  defaultValue={currentGender}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                >
                  <option value="">All</option>
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              <div>
                <label htmlFor="sort" className="text-sm font-semibold text-slate-800">
                  Sort by
                </label>
                <select
                  id="sort"
                  name="sort"
                  defaultValue={currentSort}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                >
                  <option value="latest">Latest</option>
                  <option value="price-asc">Price: Low to high</option>
                  <option value="price-desc">Price: High to low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Apply
                </button>
                <Link
                  href="/catalog"
                  className="rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset
                </Link>
              </div>
            </form>
          </aside>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      href={createCatalogHref(baseParams, {
                        category: category.slug,
                        page: undefined,
                      })}
                      className={
                        currentCategory === category.slug
                          ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                          : "rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      }
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </p>
              </div>
            </div>

            {products.length === 0 ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-950">
                  No products found
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Try changing the search term, category, size, or color filters.
                </p>
              </section>
            ) : (
              <>
                <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <StorefrontProductCard key={product._id} product={product} compact />
                  ))}
                </section>

                <div className="flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <Link
                    href={
                      page > 1
                        ? createCatalogHref(baseParams, { page: String(page - 1) })
                        : "#"
                    }
                    className={
                      page > 1
                        ? "rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        : "cursor-not-allowed rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-300"
                    }
                  >
                    Previous
                  </Link>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                      .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                      .map((pageNumber) => (
                        <Link
                          key={pageNumber}
                          href={createCatalogHref(baseParams, { page: String(pageNumber) })}
                          className={
                            pageNumber === page
                              ? "flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white"
                              : "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          }
                        >
                          {pageNumber}
                        </Link>
                      ))}
                  </div>

                  <Link
                    href={
                      page < totalPages
                        ? createCatalogHref(baseParams, { page: String(page + 1) })
                        : "#"
                    }
                    className={
                      page < totalPages
                        ? "rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        : "cursor-not-allowed rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-300"
                    }
                  >
                    Next
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
