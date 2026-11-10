import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { requireOwner, noStore } from "@/lib/owner";

export const dynamic = "force-dynamic";

function isDay(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  const ownerCtx = await requireOwner(request);
  if (ownerCtx instanceof Response) return ownerCtx;

  const day = new URL(request.url).searchParams.get("day") ?? "";
  if (!isDay(day)) {
    return Response.json({ error: "invalid_day" }, { status: 400, headers: noStore });
  }

  const entries = await sql<{
    id: string;
    day: string;
    memo: string;
    project_id: string | null;
  }>(
    `select id, to_char(day, 'YYYY-MM-DD') as day, memo, project_id
     from day_entries where owner = $1 and day = $2::date`,
    [ownerCtx.owner, day],
  );

  const photos = await sql<{
    id: string;
    day: string;
    data_url: string;
    caption: string;
    created_at: string;
  }>(
    `select id, to_char(day, 'YYYY-MM-DD') as day, data_url, caption, created_at::text
     from photos where owner = $1 and day = $2::date
     order by created_at desc`,
    [ownerCtx.owner, day],
  );

  return Response.json(
    {
      entry: entries[0]
        ? {
            id: entries[0].id,
            day: String(entries[0].day).slice(0, 10),
            memo: entries[0].memo,
            project_id: entries[0].project_id,
          }
        : { id: null, day, memo: "", project_id: null },
      photos: photos.map((p) => ({
        ...p,
        day: String(p.day).slice(0, 10),
      })),
    },
    { headers: noStore },
  );
}

export async function PUT(request: Request) {
  const ownerCtx = await requireOwner(request);
  if (ownerCtx instanceof Response) return ownerCtx;

  const body = (await request.json()) as {
    day?: string;
    memo?: string;
    project_id?: string | null;
  };
  const day = body.day ?? "";
  if (!isDay(day)) {
    return Response.json({ error: "invalid_day" }, { status: 400, headers: noStore });
  }

  const memo = typeof body.memo === "string" ? body.memo.slice(0, 2000) : "";
  let projectId = body.project_id ?? null;
  if (projectId) {
    const owned = await sql(
      `select id from projects where id = $1 and owner = $2`,
      [projectId, ownerCtx.owner],
    );
    if (owned.length === 0) projectId = null;
  }

  const existing = await sql<{ id: string }>(
    `select id from day_entries where owner = $1 and day = $2::date`,
    [ownerCtx.owner, day],
  );

  if (existing[0]) {
    await sql(
      `update day_entries set memo = $1, project_id = $2 where id = $3 and owner = $4`,
      [memo, projectId, existing[0].id, ownerCtx.owner],
    );
    return Response.json(
      { id: existing[0].id, day, memo, project_id: projectId },
      { headers: noStore },
    );
  }

  const id = randomUUID();
  await sql(
    `insert into day_entries (id, owner, day, memo, project_id) values ($1, $2, $3::date, $4, $5)`,
    [id, ownerCtx.owner, day, memo, projectId],
  );
  return Response.json({ id, day, memo, project_id: projectId }, { headers: noStore });
}
