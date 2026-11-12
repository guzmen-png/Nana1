import { sql } from "@/lib/db";
import { requireOwner, noStore } from "@/lib/owner";
import type { CalendarDaySummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ownerCtx = await requireOwner(request);
  if (ownerCtx instanceof Response) return ownerCtx;

  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return Response.json({ error: "invalid_range" }, { status: 400, headers: noStore });
  }

  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  const rows = await sql<{
    day: string;
    photo_count: string | number;
    cover_url: string | null;
    project_id: string | null;
    project_color: string | null;
    memo: string | null;
  }>(
    `select
       to_char(d.day, 'YYYY-MM-DD') as day,
       coalesce(p.photo_count, 0) as photo_count,
       p.cover_url,
       e.project_id,
       pr.color as project_color,
       e.memo
     from (
       select distinct day from photos where owner = $1 and day >= $2::date and day < $3::date
       union
       select day from day_entries where owner = $1 and day >= $2::date and day < $3::date
     ) d
     left join day_entries e on e.owner = $1 and e.day = d.day
     left join projects pr on pr.id = e.project_id
     left join lateral (
       select count(*)::int as photo_count,
              (array_agg(data_url order by created_at desc))[1] as cover_url
       from photos ph
       where ph.owner = $1 and ph.day = d.day
     ) p on true
     order by d.day`,
    [ownerCtx.owner, start, end],
  );

  const days: CalendarDaySummary[] = rows.map((row) => ({
    day: String(row.day).slice(0, 10),
    photo_count: Number(row.photo_count) || 0,
    cover_url: row.cover_url,
    project_id: row.project_id,
    project_color: row.project_color,
    has_memo: Boolean(row.memo && row.memo.trim()),
  }));

  return Response.json({ days }, { headers: noStore });
}
