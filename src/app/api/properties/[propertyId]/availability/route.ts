import { NextRequest, NextResponse } from "next/server";
import { getLivePropertyAvailability } from "@/lib/availability";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const { searchParams } = new URL(req.url);

    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";

    const result = await getLivePropertyAvailability({
      propertyId,
      checkIn,
      checkOut,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to check live availability:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check availability" },
      { status: 500 }
    );
  }
}
