import { NextResponse } from "next/server";
import sharp from "sharp";
import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB — generous since we compress before storing
const MAX_DIMENSION = 1200; // px, long edge
const JPEG_QUALITY = 78;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image must be smaller than 8MB" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const compressed = await sharp(Buffer.from(arrayBuffer))
    .rotate() // apply EXIF orientation before stripping metadata
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  const dataUri = `data:image/jpeg;base64,${compressed.toString("base64")}`;

  return NextResponse.json({ url: dataUri });
}
