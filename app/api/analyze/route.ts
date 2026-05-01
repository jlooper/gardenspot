import { FinishReason, GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a gardening expert analyzing yard photos to identify sun and shade zones.
Respond with structured JSON only (no markdown, no commentary).`

const USER_PROMPT = `Analyze these three yard photos taken at different times of day to map sun and shade zones for gardening.

Photo 1 = Morning (8–10 AM)
Photo 2 = Noon (11 AM–1 PM)
Photo 3 = Afternoon (3–5 PM)

Based on visible shadows and sunlight patterns, classify each distinct area using:
- full_sun: direct sun about 6+ hours (bright in morning and noon)
- part_sun: direct sun about 3–6 hours (bright in one or two photos)
- shade: mostly shaded, especially at noon

Consider: open lawn, fences/walls/trees, north/south-facing areas, structures.

For each zone, set region x, y, width, height as percentages of the image (0–100): x from the left, y from the top.

Set primaryPhotoIndex to 1, 2, or 3 depending on which single photo best represents the overall yard for overlay (usually noon = 2).

Write summary as 2–3 sentences on overall sunlight patterns.

Keep labels brief (under 50 characters) and notes under 160 characters so the JSON stays compact.`

/** Constrains the model to valid JSON (avoids TypeScript-style "a" | "b" in strings). */
const ANALYSIS_RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    zones: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: {
            type: SchemaType.STRING,
            enum: ['full_sun', 'part_sun', 'shade'],
            description: 'Sun exposure category',
          },
          label: { type: SchemaType.STRING, description: 'Short human-readable zone name' },
          region: {
            type: SchemaType.OBJECT,
            properties: {
              x: { type: SchemaType.NUMBER, description: 'Left edge % (0-100)' },
              y: { type: SchemaType.NUMBER, description: 'Top edge % (0-100)' },
              width: { type: SchemaType.NUMBER, description: 'Width % (0-100)' },
              height: { type: SchemaType.NUMBER, description: 'Height % (0-100)' },
            },
            required: ['x', 'y', 'width', 'height'],
          },
          confidence: {
            type: SchemaType.STRING,
            enum: ['high', 'medium', 'low'],
          },
          notes: { type: SchemaType.STRING, description: 'One sentence rationale' },
        },
        required: ['type', 'label', 'region', 'confidence', 'notes'],
      },
    },
    primaryPhotoIndex: {
      type: SchemaType.INTEGER,
      description: '1 = morning, 2 = noon, 3 = afternoon',
    },
    summary: { type: SchemaType.STRING },
  },
  required: ['zones', 'primaryPhotoIndex', 'summary'],
}

// gemini-2.0-flash free-tier quota is often 0; 2.5 Flash is the usual free-tier default in current docs.
const DEFAULT_MODEL = 'gemini-2.5-flash'

async function fetchImagePart(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch image (${res.status}): ${url}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const rawType = res.headers.get('content-type')?.split(';')[0]?.trim()
  const mimeType =
    rawType && rawType.startsWith('image/')
      ? rawType
      : 'image/jpeg'
  return {
    inlineData: {
      mimeType,
      data: buf.toString('base64'),
    },
  }
}

/** Pulls the first top-level `{...}` object, respecting strings (handles extra prose or fences). */
function extractJsonObject(text: string): string {
  let t = text.trim()
  const fence = /```(?:json)?\s*([\s\S]*?)```/
  const fm = t.match(fence)
  if (fm) t = fm[1].trim()

  const start = t.indexOf('{')
  if (start === -1) {
    throw new SyntaxError('No JSON object found in model output')
  }
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < t.length; i++) {
    const c = t[i]
    if (escape) {
      escape = false
      continue
    }
    if (c === '\\' && inString) {
      escape = true
      continue
    }
    if (c === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (c === '{') depth++
    if (c === '}') {
      depth--
      if (depth === 0) return t.slice(start, i + 1)
    }
  }
  throw new SyntaxError('Incomplete JSON: unmatched braces (response may be truncated)')
}

function parseModelJson(text: string) {
  const t = text.trim()
  if (!t) throw new SyntaxError('Empty model output')
  try {
    return JSON.parse(t)
  } catch {
    return JSON.parse(extractJsonObject(t))
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server missing GEMINI_API_KEY. Add it to .env.local.' },
      { status: 500 }
    )
  }

  try {
    const { photos } = await req.json()

    const morning = photos.find((p: { timeOfDay: string }) => p.timeOfDay === 'morning')
    const noon = photos.find((p: { timeOfDay: string }) => p.timeOfDay === 'noon')
    const afternoon = photos.find((p: { timeOfDay: string }) => p.timeOfDay === 'afternoon')

    if (!morning || !noon || !afternoon) {
      return NextResponse.json({ error: 'All three photos required.' }, { status: 400 })
    }

    const [morningPart, noonPart, afternoonPart] = await Promise.all([
      fetchImagePart(morning.url),
      fetchImagePart(noon.url),
      fetchImagePart(afternoon.url),
    ])

    const genAI = new GoogleGenerativeAI(apiKey)
    const modelName = process.env.GEMINI_MODEL ?? DEFAULT_MODEL
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
    })

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: USER_PROMPT },
            { text: 'Photo 1 — Morning:' },
            morningPart,
            { text: 'Photo 2 — Noon:' },
            noonPart,
            { text: 'Photo 3 — Afternoon:' },
            afternoonPart,
          ],
        },
      ],
      generationConfig: {
        // 2.5 models may reserve budget for internal reasoning; keep headroom for JSON.
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_RESPONSE_SCHEMA,
      },
    })

    const cand = result.response.candidates?.[0]
    const reason = cand?.finishReason
    if (reason === FinishReason.MAX_TOKENS) {
      return NextResponse.json(
        { error: 'Analysis was cut off (output limit). Try again, or use fewer / smaller photos.' },
        { status: 502 }
      )
    }
    if (reason === FinishReason.SAFETY || reason === FinishReason.RECITATION) {
      return NextResponse.json(
        { error: 'Analysis was blocked by content safety settings. Try different photos.' },
        { status: 422 }
      )
    }

    const text = result.response.text()
    if (!text) {
      return NextResponse.json({ error: 'No response from model.' }, { status: 502 })
    }

    let parsed: unknown
    try {
      parsed = parseModelJson(text)
    } catch (e) {
      console.error('analyze JSON parse failed; length=', text.length, 'preview=', text.slice(0, 400))
      throw e
    }
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('analyze error', err)
    return NextResponse.json({ error: 'Analysis failed. Check server logs.' }, { status: 500 })
  }
}
