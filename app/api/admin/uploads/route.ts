import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getAdminApiSession } from "@/lib/admin";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function fileExtensionFromType(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

export async function POST(request: Request) {
  const authResult = await getAdminApiSession();

  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ message: "Image file is required." }, { status: 400 });
    }

    if (!allowedMimeTypes.has(file.type)) {
      return Response.json(
        { message: "Only JPG, PNG, WEBP, and GIF images are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return Response.json(
        { message: "Image must be 5 MB or smaller." },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadsDir, { recursive: true });

    const extension = fileExtensionFromType(file.type);
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, buffer);

    return Response.json({
      url: `/uploads/products/${fileName}`,
      alt: file.name.replace(/\.[^.]+$/, ""),
    });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to upload image.",
      },
      { status: 500 }
    );
  }
}
