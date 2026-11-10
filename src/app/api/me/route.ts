import { requireOwner, noStore } from "@/lib/owner";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const owner = await requireOwner(request);
  if (owner instanceof Response) return owner;
  return Response.json(
    { name: owner.name, simulated: owner.simulated },
    { headers: noStore },
  );
}
