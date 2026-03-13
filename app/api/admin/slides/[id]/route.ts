import mongoose from "mongoose";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import Slide from "@/models/Slide";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function invalidIdResponse() {
  return Response.json({ message: "Invalid slide id." }, { status: 400 });
}

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

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await getAdminApiSession();
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return invalidIdResponse();

  try {
    await connectToDatabase();
    const slide = await Slide.findById(id);
    if (!slide) {
      return Response.json({ message: "Slide not found." }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    slide.title = typeof body.title === "string" ? body.title.trim() : slide.title;
    slide.subtitle = typeof body.subtitle === "string" ? body.subtitle.trim() : null;
    slide.description = typeof body.description === "string" ? body.description.trim() : null;
    slide.imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : slide.imageUrl;
    slide.ctaLabel = typeof body.ctaLabel === "string" ? body.ctaLabel.trim() : null;
    slide.ctaHref = typeof body.ctaHref === "string" ? body.ctaHref.trim() : null;
    slide.badge = typeof body.badge === "string" ? body.badge.trim() : null;
    slide.isActive = body.isActive !== false;
    slide.sortOrder = Number(body.sortOrder) || 0;
    await slide.save();

    return Response.json({ slide: serializeSlide(slide.toObject()) });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Failed to update slide." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await getAdminApiSession();
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return invalidIdResponse();

  try {
    await connectToDatabase();
    const slide = await Slide.findById(id);
    if (!slide) {
      return Response.json({ message: "Slide not found." }, { status: 404 });
    }

    await slide.deleteOne();
    return Response.json({ message: "Slide deleted." });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Failed to delete slide." },
      { status: 500 }
    );
  }
}
