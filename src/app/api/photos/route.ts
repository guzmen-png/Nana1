import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { requireOwner, noStore } from "@/lib/owner";

export const dynamic = "force-dynamic";

const MAX_DATA_URL = 1_200_000;

function isDay(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: Request) {
  const ownerCtx = await requireOwner(request);
  if (ownerCtx instanceof Response) return ownerCtx;

  const body = (await request.json()) as {
    day?: string;
    data_url?: string;
    caption?: string;
  };
  const day = body.day ?? "";
  const dataUrl = body.data_url ?? "";
  const caption = typeof body.caption === "string" ? body.caption.slice(0, 200) : "";

  if (!isDay(day)) {
    return Response.json({ error: "invalid_day" }, { status: 400, headers: noStore });
  }
  if (!dataUrl.startsWith("data:image/") || dataUrl.length > MAX_DATA_URL) {
    return Response.json({ error: "invalid_image" }, { status: 400, headers: noStore });
  }

  const countRows = await sql<{ c: string | number }>(
    `select count(*)::int as c from photos where owner = $1 and day = $2::date`,
    [ownerCtx.owner, day],
  );
  if (Number(countRows[0]?.c ?? 0) >= 12) {
    return Response.json({ error: "day_full" }, { status: 400, headers: noStore });
  }

  const id = randomUUID();
  await sql(
    `insert into photos (id, owner, day, data_url, caption) values ($1, $2, $3::date, $4, $5)`,
    [id, ownerCtx.owner, day, dataUrl, caption],
  );

  return Response.json(
    { id, day, data_url: dataUrl, caption, created_at: new Date().toISOString() },
    { status: 201, headers: noStore },
  );
}

export async function DELETE(request: Request) {
  const ownerCtx = await requireOwner(request);
  if (ownerCtx instanceof Response) return ownerCtx;

  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) {
    return Response.json({ error: "missing_id" }, { status: 400, headers: noStore });
  }

  await sql(`delete from photos where id = $1 and owner = $2`, [id, ownerCtx.owner]);
  return new Response(null, { status: 204, headers: noStore });
}
