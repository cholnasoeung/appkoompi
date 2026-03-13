import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import Slide from "@/models/Slide";

function serializeSlide(slide: {
  _id: { toString(): string };
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  badge?: string | null;
  isActive: boolean;
  sortOrder: number;
}) {
  return {
    _id: slide._id.toString(),
    title: slide.title,
    subtitle: slide.subtitle ?? null,
    description: slide.description ?? null,
    imageUrl: slide.imageUrl,
    ctaLabel: slide.ctaLabel ?? null,
    ctaHref: slide.ctaHref ?? null,
    badge: slide.badge ?? null,
    isActive: slide.isActive,
    sortOrder: slide.sortOrder,
  };
}

export async function POST(request: Request) {
  const authResult = await getAdminApiSession();

  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    await connectToDatabase();
    const body = (await request.json()) as Record<string, unknown>;

    const slide = await Slide.create({
      title: typeof body.title === "string" ? body.title.trim() : "",
      subtitle: typeof body.subtitle === "string" ? body.subtitle.trim() : null,
      description: typeof body.description === "string" ? body.description.trim() : null,
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl.trim() : "",
      ctaLabel: typeof body.ctaLabel === "string" ? body.ctaLabel.trim() : null,
      ctaHref: typeof body.ctaHref === "string" ? body.ctaHref.trim() : null,
      badge: typeof body.badge === "string" ? body.badge.trim() : null,
      isActive: body.isActive !== false,
      sortOrder: Number(body.sortOrder) || 0,
    });

    return Response.json({ slide: serializeSlide(slide.toObject()) }, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Failed to create slide." },
      { status: 500 }
    );
  }
}
