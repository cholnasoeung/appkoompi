import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
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
}

export async function POST(request: Request) {
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
}
