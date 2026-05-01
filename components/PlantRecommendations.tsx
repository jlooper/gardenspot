'use client'
import { ZoneRegion, SunZone, GrowZoneInfo } from '@/lib/types'
import { getRecommendedPlants } from '@/lib/plants'

interface Props {
  zones: ZoneRegion[]
  growZone: GrowZoneInfo
}

const ZONE_META: Record<SunZone, { label: string; color: string }> = {
  full_sun: { label: 'Full Sun',  color: '#f59e0b' },
  part_sun: { label: 'Part Sun',  color: '#f97316' },
  shade:    { label: 'Shade',     color: '#6366f1' },
}

export default function PlantRecommendations({ zones, growZone }: Props) {
  // Deduplicate sun zone types present in analysis
  const sunTypes = [...new Set(zones.map(z => z.type))]

  return (
    <div>
      <p style={{ marginBottom: 24, color: 'var(--muted)', fontSize: '0.9rem' }}>
        Showing plants suited to USDA Zone <strong>{growZone.zone}</strong> ({growZone.temperatureRange}).
      </p>

      {sunTypes.map(sunType => {
        const plants = getRecommendedPlants(sunType, growZone.numericZone)
        const meta = ZONE_META[sunType]
        const spotNames = zones.filter(z => z.type === sunType).map(z => z.label).join(', ')

        return (
          <div key={sunType} className="zone-section">
            <div className="zone-heading">
              <div className="zone-dot" style={{ background: meta.color }} />
              <div>
                <div className="zone-label">{meta.label}</div>
                <div className="zone-sublabel">{spotNames}</div>
              </div>
            </div>

            {plants.length === 0 ? (
              <p className="no-plants">No specific recommendations for Zone {growZone.zone} in this sun category.</p>
            ) : (
              <div className="plants-grid">
                {plants.map(plant => (
                  <div key={plant.name} className="plant-card">
                    <div className="plant-name">{plant.emoji} {plant.name}</div>
                    <div className="plant-notes">{plant.notes}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
