import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proof } = body;

    if (!proof) {
      return Response.json({ valid: false, error: "Missing proof" }, { status: 400 });
    }

    const appSecret = process.env.RECLAIM_APP_SECRET;
    if (!appSecret) {
      return Response.json(
        { valid: false, error: "RECLAIM_APP_SECRET not configured" },
        { status: 500 }
      );
    }

    const providerId = process.env.RECLAIM_PROVIDER_ID ?? "";
    const expectedOwner = process.env.NEXT_PUBLIC_EXPECTED_OWNER ?? "";

    try {
      const response = await fetch("https://api.reclaimprotocol.org/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${appSecret}`,
        },
        body: JSON.stringify({
          proof,
          providerId,
          expectedOwner,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return Response.json(
          { valid: false, error: `Reclaim API error: ${errorText}` },
          { status: 502 }
        );
      }

      const result = await response.json();
      return Response.json({ valid: result.valid ?? true, data: result });
    } catch (fetchError) {
      return Response.json(
        {
          valid: false,
          error:
            fetchError instanceof Error ? fetchError.message : "Reclaim API request failed",
        },
        { status: 502 }
      );
    }
  } catch (error) {
    return Response.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : "Invalid request",
      },
      { status: 400 }
    );
  }
}
