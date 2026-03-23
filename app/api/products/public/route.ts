import { getStorefrontData, getStorefrontSlides } from "@/lib/storefront";

export async function GET() {
  try {
    const [storefrontData, slides] = await Promise.all([
      getStorefrontData(),
      getStorefrontSlides(),
    ]);

    return Response.json({
      ...storefrontData,
      slides,
    });
  } catch (error) {
    return Response.json(
      {
        message: "Failed to fetch public storefront products.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
