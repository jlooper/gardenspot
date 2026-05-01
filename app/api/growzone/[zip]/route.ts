import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { zip: string } }
) {
  const { zip } = params

  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Invalid ZIP code' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://phzmapi.org/${zip}.json`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Zone not found for that ZIP.' }, { status: 404 })
    }

    const data = await res.json()
    // zone is e.g. "7a" — parseInt extracts the numeric part
    const numericZone = parseInt(data.zone, 10)

    return NextResponse.json({
      zone: data.zone as string,
      numericZone,
      temperatureRange: data.temperature_range as string,
    })
  } catch {
    return NextResponse.json({ error: 'Could not reach zone API.' }, { status: 502 })
  }
}
