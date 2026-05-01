'use client'
import { ZoneRegion, SunZone } from '@/lib/types'

interface Props {
  photoUrl: string
  zones: ZoneRegion[]
}

const ZONE_STYLE: Record<SunZone, { fill: string; stroke: string; label: string; dot: string }> = {
  full_sun:  { fill: 'rgba(245,158,11,0.35)',  stroke: '#f59e0b', label: 'Full Sun',  dot: '#f59e0b' },
  part_sun:  { fill: 'rgba(249,115,22,0.35)',  stroke: '#f97316', label: 'Part Sun',  dot: '#f97316' },
  shade:     { fill: 'rgba(99,102,241,0.35)',  stroke: '#6366f1', label: 'Shade',     dot: '#6366f1' },
}

export default function ZoneOverlay({ photoUrl, zones }: Props) {
  const legendTypes = [...new Set(zones.map(z => z.type))]

  return (
    <div>
      <div className="overlay-wrap">
        <img src={photoUrl} alt="Yard with garden zones" />
        <svg
          className="overlay-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {zones.map((zone, i) => {
            const s = ZONE_STYLE[zone.type]
            const cx = zone.region.x + zone.region.width / 2
            const cy = zone.region.y + zone.region.height / 2
            return (
              <g key={i}>
                <rect
                  x={zone.region.x}
                  y={zone.region.y}
                  width={zone.region.width}
                  height={zone.region.height}
                  fill={s.fill}
                  stroke={s.stroke}
                  strokeWidth={0.6}
                  rx={0.8}
                />
                <rect
                  x={cx - zone.label.length * 1.4 / 2}
                  y={cy - 3.5}
                  width={zone.label.length * 1.4}
                  height={5}
                  fill="rgba(0,0,0,0.55)"
                  rx={1}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={2.8}
                  fill="white"
                  fontWeight="600"
                  fontFamily="-apple-system, sans-serif"
                >
                  {zone.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="zone-legend">
        {legendTypes.map(type => (
          <div key={type} className="legend-item">
            <div className="legend-dot" style={{ background: ZONE_STYLE[type].dot }} />
            <span>{ZONE_STYLE[type].label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
