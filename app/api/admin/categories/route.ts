import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";

function buildErrorResponse(error: unknown, fallbackMessage: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    return Response.json({ message: "slug already exists." }, { status: 409 });
  }

  if (error instanceof Error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  return Response.json({ message: fallbackMessage }, { status: 500 });
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const authResult = await getAdminApiSession();

    if (!authResult.ok) {
      return authResult.response;
    }

    await connectToDatabase();

    const categories = await Category.find().sort({ name: 1 }).lean();

    return Response.json(
      categories.map((category) => ({
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        isActive: category.isActive,
      }))
    );
  } catch (error) {
    return buildErrorResponse(error, "Failed to fetch categories.");
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await getAdminApiSession();

    if (!authResult.ok) {
      return authResult.response;
    }

    await connectToDatabase();

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const slug = normalizeSlug(typeof body.slug === "string" ? body.slug : name);

    if (name.length < 2) {
      return Response.json(
        { message: "Category name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!slug) {
      return Response.json(
        { message: "Category slug is required." },
        { status: 400 }
      );
    }

    const category = await Category.create({
      name,
      slug,
      isActive: true,
    });

    return Response.json(
      {
        message: "Category created successfully.",
        category: {
          _id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          isActive: category.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return buildErrorResponse(error, "Failed to create category.");
  }
}
