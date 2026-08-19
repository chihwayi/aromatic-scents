import { NextResponse } from "next/server";
import { getUsdToZarRate } from "@/lib/exchangeRate";

export async function GET() {
  const usdToZar = await getUsdToZarRate();
  return NextResponse.json({ usdToZar });
}
