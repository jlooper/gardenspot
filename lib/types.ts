export type SunZone = 'full_sun' | 'part_sun' | 'shade'
export type TimeOfDay = 'morning' | 'noon' | 'afternoon'

export interface ZoneRegion {
  type: SunZone
  label: string
  region: {
    x: number      // % from left (0-100)
    y: number      // % from top (0-100)
    width: number  // % of image width (0-100)
    height: number // % of image height (0-100)
  }
  confidence: 'high' | 'medium' | 'low'
  notes: string
}

export interface AnalysisResult {
  zones: ZoneRegion[]
  primaryPhotoIndex: number
  summary: string
}

export interface Plant {
  name: string
  emoji: string
  sunRequirement: SunZone
  zones: number[]  // USDA numeric zones
  notes: string
}

export interface UploadedPhoto {
  timeOfDay: TimeOfDay
  publicId: string
  url: string
}

export interface GrowZoneInfo {
  zone: string          // e.g. "7a"
  numericZone: number   // e.g. 7
  temperatureRange: string
}
