import { getDatabaseConfigurationError } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

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
};

export type StorefrontCategory = {
  _id: string;
  name: string;
  slug: string;
  description: string;
};

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
    brand: "Cholna Studio",
    categoryName: "Travel",
    imageUrl: null,
    ratingAverage: 4.8,
    reviewCount: 124,
    tags: ["best seller", "commuter"],
    isFeatured: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Stone"],
  },
  {
    _id: "2",
    name: "Halo Desk Lamp",
    slug: "halo-desk-lamp",
    shortDescription: "Soft-focus lamp for warm evening work sessions.",
    description: "Directional lamp with dimmable glow, powder-coated body, and low-footprint base for compact desks.",
    price: 89,
    discountPrice: null,
    brand: "Cholna Studio",
    categoryName: "Workspace",
    imageUrl: null,
    ratingAverage: 4.7,
    reviewCount: 86,
    tags: ["editor pick"],
    isFeatured: true,
    sizes: ["S", "M", "L"],
    colors: ["Ivory", "Olive"],
  },
  {
    _id: "3",
    name: "Form Lounge Chair",
    slug: "form-lounge-chair",
    shortDescription: "Curved accent chair with textured upholstery.",
    description: "Statement seating piece shaped for small spaces and styled for modern interiors.",
    price: 420,
    discountPrice: 360,
    brand: "Cholna Home",
    categoryName: "Living",
    imageUrl: null,
    ratingAverage: 4.9,
    reviewCount: 41,
    tags: ["new arrival"],
    isFeatured: true,
    sizes: ["S", "M", "L"],
    colors: ["Sand", "Black"],
  },
  {
    _id: "4",
    name: "Canvas Bottle Sling",
    slug: "canvas-bottle-sling",
    shortDescription: "Crossbody hydration bag with compact side storage.",
    description: "Hands-free bottle sling with reinforced base, soft strap, and space for cards, keys, and earbuds.",
    price: 44,
    discountPrice: null,
    brand: "Cholna Move",
    categoryName: "Travel",
    imageUrl: null,
    ratingAverage: 4.6,
    reviewCount: 59,
    tags: ["on the go"],
    isFeatured: false,
    sizes: [],
    colors: ["Black", "Tan"],
  },
  {
    _id: "5",
    name: "Grid Organizer Tray",
    slug: "grid-organizer-tray",
    shortDescription: "Minimal tray for pens, chargers, and pocket carry.",
    description: "Desk organizer in matte finish with segmented compartments and soft-touch interior lining.",
    price: 32,
    discountPrice: null,
    brand: "Cholna Studio",
    categoryName: "Workspace",
    imageUrl: null,
    ratingAverage: 4.5,
    reviewCount: 72,
    tags: ["desk setup"],
    isFeatured: false,
    sizes: ["28", "30", "32", "34"],
    colors: ["Charcoal", "Khaki"],
  },
  {
    _id: "6",
    name: "Cloud Throw",
    slug: "cloud-throw",
    shortDescription: "Oversized woven blanket with a brushed finish.",
    description: "A soft statement layer for sofas and beds, finished with tonal fringe and dense texture.",
    price: 74,
    discountPrice: 58,
    brand: "Cholna Home",
    categoryName: "Living",
    imageUrl: null,
    ratingAverage: 4.8,
    reviewCount: 97,
    tags: ["cozy", "seasonal"],
    isFeatured: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Brown", "Cream"],
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
  images?: Array<{ url: string; isPrimary: boolean }>;
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
