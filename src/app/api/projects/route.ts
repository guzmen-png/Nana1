import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { requireOwner, noStore } from "@/lib/owner";

export const dynamic = "force-dynamic";

const COLORS = ["#0F6B5C", "#1F4E79", "#8B4513", "#B45309", "#7C2D12", "#334155"];

export async function GET(request: Request) {
  const ownerCtx = await requireOwner(request);
  if (ownerCtx instanceof Response) return ownerCtx;

  const rows = await sql<{
    id: string;
    name: string;
    color: string;
    note: string;
    created_at: string;
    day_count: string | number;
    photo_count: string | number;
  }>(
    `select
       p.id, p.name, p.color, p.note, p.created_at::text,
       (select count(*)::int from day_entries d where d.project_id = p.id) as day_count,
       (select count(*)::int from photos ph
         join day_entries d on d.owner = ph.owner and d.day = ph.day
         where d.project_id = p.id) as photo_count
     from projects p
     where p.owner = $1
     order by p.created_at desc`,
    [ownerCtx.owner],
  );

  return Response.json(
    {
      projects: rows.map((r) => ({
        ...r,
        day_count: Number(r.day_count) || 0,
        photo_count: Number(r.photo_count) || 0,
      })),
    },
    { headers: noStore },
  );
}

export async function POST(request: Request) {
  const ownerCtx = await requireOwner(request);
  if (ownerCtx instanceof Response) return ownerCtx;

  const body = (await request.json()) as {
    name?: string;
    color?: string;
    note?: string;
  };
  const name = (body.name ?? "").trim().slice(0, 80);
  if (!name) {
    return Response.json({ error: "name_required" }, { status: 400, headers: noStore });
  }
  const color =
    typeof body.color === "string" && /^#[0-9A-Fa-f]{6}$/.test(body.color)
      ? body.color
      : COLORS[Math.floor(Math.random() * COLORS.length)];
  const note = typeof body.note === "string" ? body.note.slice(0, 1000) : "";
  const id = randomUUID();

  await sql(
    `insert into projects (id, owner, name, color, note) values ($1, $2, $3, $4, $5)`,
    [id, ownerCtx.owner, name, color, note],
  );

  return Response.json(
    { id, name, color, note, created_at: new Date().toISOString(), day_count: 0, photo_count: 0 },
    { status: 201, headers: noStore },
  );
}

export async function PATCH(request: Request) {
  const ownerCtx = await requireOwner(request);
  if (ownerCtx instanceof Response) return ownerCtx;

  const body = (await request.json()) as {
    id?: string;
    name?: string;
    color?: string;
    note?: string;
  };
  const id = body.id ?? "";
  if (!id) {
    return Response.json({ error: "missing_id" }, { status: 400, headers: noStore });
  }

  const existing = await sql<{
    id: string;
    name: string;
    color: string;
    note: string;
  }>(`select id, name, color, note from projects where id = $1 and owner = $2`, [
    id,
    ownerCtx.owner,
  ]);
  if (!existing[0]) {
    return Response.json({ error: "not_found" }, { status: 404, headers: noStore });
  }

  const name =
    typeof body.name === "string" ? body.name.trim().slice(0, 80) || existing[0].name : existing[0].name;
  const color =
    typeof body.color === "string" && /^#[0-9A-Fa-f]{6}$/.test(body.color)
      ? body.color
      : existing[0].color;
  const note = typeof body.note === "string" ? body.note.slice(0, 1000) : existing[0].note;

  await sql(
    `update projects set name = $1, color = $2, note = $3 where id = $4 and owner = $5`,
    [name, color, note, id, ownerCtx.owner],
  );

  return Response.json({ id, name, color, note }, { headers: noStore });
}

export async function DELETE(request: Request) {
  const ownerCtx = await requireOwner(request);
  if (ownerCtx instanceof Response) return ownerCtx;

  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) {
    return Response.json({ error: "missing_id" }, { status: 400, headers: noStore });
  }

  await sql(`update day_entries set project_id = null where project_id = $1 and owner = $2`, [
    id,
    ownerCtx.owner,
  ]);
  await sql(`delete from projects where id = $1 and owner = $2`, [id, ownerCtx.owner]);
  return new Response(null, { status: 204, headers: noStore });
}
