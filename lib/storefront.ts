import { getDatabaseConfigurationError } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Slide from "@/models/Slide";

export type StorefrontProduct = {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  discountPrice: number | null;
  brand: string | null;
  categoryName: string;
  imageUrl: string | null;
  ratingAverage: number;
  reviewCount: number;
  tags: string[];
  isFeatured: boolean;
  sizes: string[];
  colors: string[];
  images: Array<{
    url: string;
    alt: string | null;
    isPrimary: boolean;
  }>;
};

export type StorefrontCategory = {
  _id: string;
  name: string;
  slug: string;
  description: string;
};

export type StorefrontSlide = {
  _id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  badge: string | null;
};

export type CatalogSortOption =
  | "latest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

export type StorefrontCatalogQuery = {
  query?: string;
  category?: string;
  size?: string;
  color?: string;
  sort?: CatalogSortOption;
  page?: number;
  pageSize?: number;
};

function normalizeCatalogSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const fallbackCategories: StorefrontCategory[] = [
  {
    _id: "living",
    name: "Living",
    slug: "living",
    description: "Layered comfort pieces with sculptural details and calm neutrals.",
  },
  {
    _id: "workspace",
    name: "Workspace",
    slug: "workspace",
    description: "Desk essentials designed to keep your setup sharp and uncluttered.",
  },
  {
    _id: "travel",
    name: "Travel",
    slug: "travel",
    description: "Compact carry pieces built for movement, storage, and durability.",
  },
];

const fallbackProducts: StorefrontProduct[] = [
  {
    _id: "1",
    name: "Aero Carry Pack",
    slug: "aero-carry-pack",
    shortDescription: "Weather-ready daily pack with modular storage.",
    description: "Lightweight utility backpack with concealed laptop sleeve, quick-access front pocket, and structured silhouette.",
    price: 138,
    discountPrice: 114,
    brand: "Urban Studio",
    categoryName: "Travel",
    imageUrl: null,
    ratingAverage: 4.8,
    reviewCount: 124,
    tags: ["best seller", "commuter"],
    isFeatured: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Stone"],
    images: [],
  },
  {
    _id: "2",
    name: "Halo Desk Lamp",
    slug: "halo-desk-lamp",
    shortDescription: "Soft-focus lamp for warm evening work sessions.",
    description: "Directional lamp with dimmable glow, powder-coated body, and low-footprint base for compact desks.",
    price: 89,
    discountPrice: null,
    brand: "Urban Studio",
    categoryName: "Workspace",
    imageUrl: null,
    ratingAverage: 4.7,
    reviewCount: 86,
    tags: ["editor pick"],
    isFeatured: true,
    sizes: ["S", "M", "L"],
    colors: ["Ivory", "Olive"],
    images: [],
  },
  {
    _id: "3",
    name: "Form Lounge Chair",
    slug: "form-lounge-chair",
    shortDescription: "Curved accent chair with textured upholstery.",
    description: "Statement seating piece shaped for small spaces and styled for modern interiors.",
    price: 420,
    discountPrice: 360,
    brand: "Modern Home",
    categoryName: "Living",
    imageUrl: null,
    ratingAverage: 4.9,
    reviewCount: 41,
    tags: ["new arrival"],
    isFeatured: true,
    sizes: ["S", "M", "L"],
    colors: ["Sand", "Black"],
    images: [],
  },
  {
    _id: "4",
    name: "Canvas Bottle Sling",
    slug: "canvas-bottle-sling",
    shortDescription: "Crossbody hydration bag with compact side storage.",
    description: "Hands-free bottle sling with reinforced base, soft strap, and space for cards, keys, and earbuds.",
    price: 44,
    discountPrice: null,
    brand: "Motion Goods",
    categoryName: "Travel",
    imageUrl: null,
    ratingAverage: 4.6,
    reviewCount: 59,
    tags: ["on the go"],
    isFeatured: false,
    sizes: [],
    colors: ["Black", "Tan"],
    images: [],
  },
  {
    _id: "5",
    name: "Grid Organizer Tray",
    slug: "grid-organizer-tray",
    shortDescription: "Minimal tray for pens, chargers, and pocket carry.",
    description: "Desk organizer in matte finish with segmented compartments and soft-touch interior lining.",
    price: 32,
    discountPrice: null,
    brand: "Urban Studio",
    categoryName: "Workspace",
    imageUrl: null,
    ratingAverage: 4.5,
    reviewCount: 72,
    tags: ["desk setup"],
    isFeatured: false,
    sizes: ["28", "30", "32", "34"],
    colors: ["Charcoal", "Khaki"],
    images: [],
  },
  {
    _id: "6",
    name: "Cloud Throw",
    slug: "cloud-throw",
    shortDescription: "Oversized woven blanket with a brushed finish.",
    description: "A soft statement layer for sofas and beds, finished with tonal fringe and dense texture.",
    price: 74,
    discountPrice: 58,
    brand: "Modern Home",
    categoryName: "Living",
    imageUrl: null,
    ratingAverage: 4.8,
    reviewCount: 97,
    tags: ["cozy", "seasonal"],
    isFeatured: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Brown", "Cream"],
    images: [],
  },
];

const fallbackSlides: StorefrontSlide[] = [
  {
    _id: "slide-1",
    title: "New season essentials",
    subtitle: "Curated arrivals",
    description: "Fresh storefront highlights with clean silhouettes, premium textures, and strong everyday utility.",
    imageUrl: "/next.svg",
    ctaLabel: "Shop catalog",
    ctaHref: "/catalog",
    badge: "Campaign drop",
  },
  {
    _id: "slide-2",
    title: "Built for daily wear",
    subtitle: "Updated weekly",
    description: "Rotate hero images, launch new campaigns, and keep the homepage moving with a managed slider.",
    imageUrl: "/globe.svg",
    ctaLabel: "Browse products",
    ctaHref: "/catalog?sort=latest",
    badge: "Weekly picks",
  },
];

function mapProduct(product: {
  _id: { toString(): string };
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  discountPrice?: number | null;
  brand?: string | null;
  images?: Array<{ url: string; alt?: string | null; isPrimary: boolean }>;
  ratingAverage?: number;
  reviewCount?: number;
  tags?: string[];
  isFeatured: boolean;
  sizes?: string[];
  colors?: string[];
  categoryId:
    | { _id?: { toString(): string }; name?: string | null }
    | { toString(): string };
}) {
  const primaryImage =
    product.images?.find((image) => image.isPrimary) ?? product.images?.[0];
  const categoryName =
    typeof product.categoryId === "object" && "name" in product.categoryId
      ? product.categoryId.name ?? "Collection"
      : "Collection";

  return {
    _id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? "Curated for everyday use.",
    description: product.description ?? "A refined product from the latest collection.",
    price: product.price,
    discountPrice: product.discountPrice ?? null,
    brand: product.brand ?? null,
    categoryName,
    imageUrl: primaryImage?.url ?? null,
    ratingAverage: product.ratingAverage ?? 0,
    reviewCount: product.reviewCount ?? 0,
    tags: product.tags ?? [],
    isFeatured: product.isFeatured,
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    images:
      product.images?.map((image) => ({
        url: image.url,
        alt: image.alt ?? null,
        isPrimary: image.isPrimary,
      })) ?? [],
  } satisfies StorefrontProduct;
}

export async function getStorefrontData() {
  const configurationError = getDatabaseConfigurationError();

  if (configurationError) {
    return {
      categories: fallbackCategories,
      featuredProducts: fallbackProducts.filter((product) => product.isFeatured).slice(0, 4),
      latestProducts: fallbackProducts,
      usesFallback: true,
    };
  }

  try {
    await connectToDatabase();

    const [categories, featuredProducts, latestProducts] = await Promise.all([
      Category.find({ isActive: true }).sort({ name: 1 }).limit(3).lean(),
      Product.find({ isActive: true, isFeatured: true })
        .populate("categoryId", "name")
        .sort({ updatedAt: -1 })
        .limit(4)
        .lean(),
      Product.find({ isActive: true })
        .populate("categoryId", "name")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    const mappedCategories = categories.map((category) => ({
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description ?? "Curated pieces for modern everyday use.",
    }));

    const mappedFeatured = featuredProducts.map(mapProduct);
    const mappedLatest = latestProducts.map(mapProduct);

    if (mappedLatest.length === 0) {
      return {
        categories: fallbackCategories,
        featuredProducts: fallbackProducts.filter((product) => product.isFeatured).slice(0, 4),
        latestProducts: fallbackProducts,
        usesFallback: true,
      };
    }

    return {
      categories: mappedCategories.length > 0 ? mappedCategories : fallbackCategories,
      featuredProducts: mappedFeatured.length > 0 ? mappedFeatured : mappedLatest.slice(0, 4),
      latestProducts: mappedLatest,
      usesFallback: false,
    };
  } catch {
    return {
      categories: fallbackCategories,
      featuredProducts: fallbackProducts.filter((product) => product.isFeatured).slice(0, 4),
      latestProducts: fallbackProducts,
      usesFallback: true,
    };
  }
}

export async function getStorefrontSlides() {
  const configurationError = getDatabaseConfigurationError();

  if (configurationError) {
    return fallbackSlides;
  }

  try {
    await connectToDatabase();

    const slides = await Slide.find({ isActive: true })
      .sort({ sortOrder: 1, updatedAt: -1 })
      .lean();

    if (slides.length === 0) {
      return fallbackSlides;
    }

    return slides.map((slide) => ({
      _id: slide._id.toString(),
      title: slide.title,
      subtitle: slide.subtitle ?? null,
      description: slide.description ?? null,
      imageUrl: slide.imageUrl,
      ctaLabel: slide.ctaLabel ?? null,
      ctaHref: slide.ctaHref ?? null,
      badge: slide.badge ?? null,
    })) satisfies StorefrontSlide[];
  } catch {
    return fallbackSlides;
  }
}

export async function getStorefrontProductBySlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  const fallbackProduct =
    fallbackProducts.find((product) => product.slug === normalizedSlug) ?? null;

  const configurationError = getDatabaseConfigurationError();

  if (configurationError) {
    return {
      product: fallbackProduct,
      relatedProducts: fallbackProducts
        .filter((product) => product.slug !== normalizedSlug)
        .slice(0, 4),
      usesFallback: true,
    };
  }

  try {
    await connectToDatabase();

    const product = await Product.findOne({
      slug: normalizedSlug,
      isActive: true,
    })
      .populate("categoryId", "name _id")
      .lean();

    if (!product) {
      return {
        product: fallbackProduct,
        relatedProducts: fallbackProducts
          .filter((item) => item.slug !== normalizedSlug)
          .slice(0, 4),
        usesFallback: Boolean(fallbackProduct),
      };
    }

    const mappedProduct = mapProduct(product);
    const categoryId =
      product.categoryId &&
      typeof product.categoryId === "object" &&
      "_id" in product.categoryId &&
      product.categoryId._id
        ? product.categoryId._id
        : null;

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
    })
      .populate("categoryId", "name")
      .sort({ updatedAt: -1 })
      .limit(4)
      .lean();

    return {
      product: mappedProduct,
      relatedProducts:
        relatedProducts.length > 0
          ? relatedProducts.map(mapProduct)
          : fallbackProducts
              .filter((item) => item.slug !== normalizedSlug)
              .slice(0, 4),
      usesFallback: false,
    };
  } catch {
    return {
      product: fallbackProduct,
      relatedProducts: fallbackProducts
        .filter((product) => product.slug !== normalizedSlug)
        .slice(0, 4),
      usesFallback: true,
    };
  }
}

function matchesCatalogFilters(
  product: StorefrontProduct,
  filters: Required<Omit<StorefrontCatalogQuery, "page" | "pageSize">>
) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  if (
    normalizedQuery &&
    ![
      product.name,
      product.shortDescription,
      product.description,
      product.brand ?? "",
      product.categoryName,
      ...product.tags,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  ) {
    return false;
  }

  if (
    filters.category &&
    normalizeCatalogSlug(product.categoryName) !== normalizeCatalogSlug(filters.category)
  ) {
    return false;
  }

  if (filters.size && !product.sizes.some((size) => size.toLowerCase() === filters.size.toLowerCase())) {
    return false;
  }

  if (
    filters.color &&
    !product.colors.some((color) => color.toLowerCase() === filters.color.toLowerCase())
  ) {
    return false;
  }

  return true;
}

function sortCatalogProducts(products: StorefrontProduct[], sort: CatalogSortOption) {
  return [...products].sort((left, right) => {
    const leftPrice = left.discountPrice ?? left.price;
    const rightPrice = right.discountPrice ?? right.price;

    switch (sort) {
      case "price-asc":
        return leftPrice - rightPrice;
      case "price-desc":
        return rightPrice - leftPrice;
      case "name-asc":
        return left.name.localeCompare(right.name);
      case "name-desc":
        return right.name.localeCompare(left.name);
      case "latest":
      default:
        return 0;
    }
  });
}

export async function getStorefrontCatalog({
  query = "",
  category = "",
  size = "",
  color = "",
  sort = "latest",
  page = 1,
  pageSize = 9,
}: StorefrontCatalogQuery = {}) {
  const normalizedPage = Math.max(1, page);
  const normalizedPageSize = Math.max(1, pageSize);
  const filters = { query, category, size, color, sort };
  const configurationError = getDatabaseConfigurationError();

  if (configurationError) {
    const filteredProducts = sortCatalogProducts(
      fallbackProducts.filter((product) => matchesCatalogFilters(product, filters)),
      sort
    );
    const totalProducts = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / normalizedPageSize));
    const currentPage = Math.min(normalizedPage, totalPages);
    const paginatedProducts = filteredProducts.slice(
      (currentPage - 1) * normalizedPageSize,
      currentPage * normalizedPageSize
    );

    return {
      products: paginatedProducts,
      categories: fallbackCategories,
      totalProducts,
      totalPages,
      currentPage,
      availableSizes: Array.from(new Set(fallbackProducts.flatMap((product) => product.sizes))).sort(),
      availableColors: Array.from(new Set(fallbackProducts.flatMap((product) => product.colors))).sort(),
      usesFallback: true,
    };
  }

  try {
    await connectToDatabase();

    const categoryDocs = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    const categories = categoryDocs.map((category) => ({
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description ?? "Curated pieces for modern everyday use.",
    }));

    const categoryDoc = category
      ? categoryDocs.find(
          (item) =>
            item.slug.toLowerCase() === category.toLowerCase() ||
            item.name.toLowerCase() === category.toLowerCase()
        )
      : null;

    const mongoQuery: Record<string, unknown> = { isActive: true };

    if (query.trim()) {
      mongoQuery.$or = [
        { name: { $regex: query.trim(), $options: "i" } },
        { shortDescription: { $regex: query.trim(), $options: "i" } },
        { description: { $regex: query.trim(), $options: "i" } },
        { brand: { $regex: query.trim(), $options: "i" } },
        { tags: { $in: [new RegExp(query.trim(), "i")] } },
      ];
    }

    if (categoryDoc) {
      mongoQuery.categoryId = categoryDoc._id;
    }

    if (size) {
      mongoQuery.sizes = size;
    }

    if (color) {
      mongoQuery.colors = color;
    }

    const sortBy: Array<[string, 1 | -1]> =
      sort === "price-asc"
        ? [["price", 1]]
        : sort === "price-desc"
          ? [["price", -1]]
          : sort === "name-asc"
            ? [["name", 1]]
            : sort === "name-desc"
              ? [["name", -1]]
              : [["createdAt", -1]];

    const [totalProducts, productDocs, sizeDocs, colorDocs] = await Promise.all([
      Product.countDocuments(mongoQuery),
      Product.find(mongoQuery)
        .populate("categoryId", "name")
        .sort(sortBy)
        .skip((normalizedPage - 1) * normalizedPageSize)
        .limit(normalizedPageSize)
        .lean(),
      Product.distinct("sizes", { isActive: true }),
      Product.distinct("colors", { isActive: true }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalProducts / normalizedPageSize));
    const currentPage = Math.min(normalizedPage, totalPages);

    return {
      products: productDocs.map(mapProduct),
      categories: categories.length > 0 ? categories : fallbackCategories,
      totalProducts,
      totalPages,
      currentPage,
      availableSizes: (sizeDocs as string[]).filter(Boolean).sort(),
      availableColors: (colorDocs as string[]).filter(Boolean).sort(),
      usesFallback: false,
    };
  } catch {
    const filteredProducts = sortCatalogProducts(
      fallbackProducts.filter((product) => matchesCatalogFilters(product, filters)),
      sort
    );
    const totalProducts = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / normalizedPageSize));
    const currentPage = Math.min(normalizedPage, totalPages);

    return {
      products: filteredProducts.slice(
        (currentPage - 1) * normalizedPageSize,
        currentPage * normalizedPageSize
      ),
      categories: fallbackCategories,
      totalProducts,
      totalPages,
      currentPage,
      availableSizes: Array.from(new Set(fallbackProducts.flatMap((product) => product.sizes))).sort(),
      availableColors: Array.from(new Set(fallbackProducts.flatMap((product) => product.colors))).sort(),
      usesFallback: true,
    };
  }
}
