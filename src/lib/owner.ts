import { requireIdentity } from "../../cursor/identity";

export type OwnerContext = {
  owner: string;
  name: string;
  simulated: boolean;
};

export async function requireOwner(
  request: Request,
): Promise<OwnerContext | Response> {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;
  if (identity.kind === "key") {
    return Response.json(
      { error: "person_required" },
      { status: 403, headers: { "cache-control": "private, no-store" } },
    );
  }
  const stage = identity.stage === "preview" ? "preview" : "prod";
  return {
    owner: `${identity.sub}:${stage}`,
    name: identity.name || "나날",
    simulated: identity.simulated === true,
  };
}

export const noStore = { "cache-control": "private, no-store" } as const;
