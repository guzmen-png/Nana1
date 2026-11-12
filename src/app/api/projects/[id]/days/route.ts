import { sql } from "@/lib/db";
import { requireOwner, noStore } from "@/lib/owner";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const ownerCtx = await requireOwner(request);
  if (ownerCtx instanceof Response) return ownerCtx;

  const { id } = await context.params;
  const owned = await sql(`select id from projects where id = $1 and owner = $2`, [
    id,
    ownerCtx.owner,
  ]);
  if (owned.length === 0) {
    return Response.json({ error: "not_found" }, { status: 404, headers: noStore });
  }

  const days = await sql<{
    day: string;
    memo: string;
    photo_count: string | number;
    cover_url: string | null;
  }>(
    `select
       to_char(d.day, 'YYYY-MM-DD') as day,
       d.memo,
       coalesce(p.photo_count, 0) as photo_count,
       p.cover_url
     from day_entries d
     left join lateral (
       select count(*)::int as photo_count,
              (array_agg(data_url order by created_at desc))[1] as cover_url
       from photos ph
       where ph.owner = d.owner and ph.day = d.day
     ) p on true
     where d.owner = $1 and d.project_id = $2
     order by d.day desc`,
    [ownerCtx.owner, id],
  );

  return Response.json(
    {
      days: days.map((d) => ({
        day: String(d.day).slice(0, 10),
        memo: d.memo,
        photo_count: Number(d.photo_count) || 0,
        cover_url: d.cover_url,
      })),
    },
    { headers: noStore },
  );
}
