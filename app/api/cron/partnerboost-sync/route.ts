import type { NextRequest } from "next/server";
import {
  syncPartnerBoostProducts,
} from "@/lib/affiliate/syncPartnerBoostProducts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  const cronSecret =
    process.env.CRON_SECRET;

  const authorization =
    request.headers.get("authorization");

  if (
    !cronSecret ||
    authorization !==
      `Bearer ${cronSecret}`
  ) {
    return Response.json(
      {
        ok: false,
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const result =
      await syncPartnerBoostProducts();

    return Response.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "PartnerBoost cron sync failed:",
      error,
    );

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown sync error",
      },
      {
        status: 500,
      },
    );
  }
}
