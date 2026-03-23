import {
  type CatalogSortOption,
  getStorefrontCatalog,
} from "@/lib/storefront";

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return Math.floor(parsedValue);
}

function parseSort(value: string | null): CatalogSortOption {
  if (
    value === "price-asc" ||
    value === "price-desc" ||
    value === "name-asc" ||
    value === "name-desc" ||
    value === "latest"
  ) {
    return value;
  }

  return "latest";
}

function parseGender(value: string | null): "men" | "women" | "unisex" | "" {
  if (value === "men" || value === "women" || value === "unisex") {
    return value;
  }

  return "";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? searchParams.get("query") ?? "";
    const category = searchParams.get("category") ?? "";
    const size = searchParams.get("size") ?? "";
    const color = searchParams.get("color") ?? "";
    const gender = parseGender(searchParams.get("gender"));
    const sort = parseSort(searchParams.get("sort"));
    const page = parsePositiveInteger(searchParams.get("page"), 1);
    const pageSize = parsePositiveInteger(searchParams.get("pageSize"), 9);

    const catalog = await getStorefrontCatalog({
      query,
      category,
      size,
      color,
      gender,
      sort,
      page,
      pageSize,
    });

    return Response.json(catalog);
  } catch (error) {
    return Response.json(
      {
        message: "Failed to fetch products.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
