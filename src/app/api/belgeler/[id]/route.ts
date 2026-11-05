import { isValidObjectId } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { SellerDocument } from "@/models/SellerDocument";
import { extOf, readFile } from "@/lib/files";

export const runtime = "nodejs";

const notFound = () => new Response("Bulunamadı", { status: 404 });

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return notFound();
  const { id } = await params;
  if (!isValidObjectId(id)) return notFound();

  await connectDB();
  const doc = await SellerDocument.findById(id);
  // Başkasının belgesi var olsa bile "bulunamadı" denir
  if (!doc || (session.user.role !== "admin" && doc.user.toString() !== session.user.id)) return notFound();

  const buf = await readFile(doc.fileId);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": doc.mime,
      "Content-Disposition": `inline; filename="${doc.docKey}.${extOf(doc.mime)}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}