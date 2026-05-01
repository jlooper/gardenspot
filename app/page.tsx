'use client'
import { useState } from 'react'
import PhotoUploader from '@/components/PhotoUploader'
import ZoneOverlay from '@/components/ZoneOverlay'
import PlantRecommendations from '@/components/PlantRecommendations'
import { UploadedPhoto, AnalysisResult, GrowZoneInfo } from '@/lib/types'

export default function Home() {
  const [photos, setPhotos]           = useState<UploadedPhoto[]>([])
  const [zip, setZip]                 = useState('')
  const [growZone, setGrowZone]       = useState<GrowZoneInfo | null>(null)
  const [zoneError, setZoneError]     = useState('')
  const [analysis, setAnalysis]       = useState<AnalysisResult | null>(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const allPhotosUploaded = photos.length === 3
  const canAnalyze = allPhotosUploaded && growZone !== null && !loading

  async function handleZipLookup(value: string) {
    setZip(value)
    setGrowZone(null)
    setZoneError('')
    if (value.length !== 5) return
    try {
      const res = await fetch(`/api/growzone/${value}`)
      const data = await res.json()
      if (!res.ok) { setZoneError(data.error); return }
      setGrowZone(data)
    } catch {
      setZoneError('Could not look up zone.')
    }
  }

  async function handleAnalyze() {
    setLoading(true)
    setError('')
    setAnalysis(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setAnalysis(data)
    } catch {
      setError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const noonPhoto = photos.find(p => p.timeOfDay === 'noon')

  return (
    <main className="app">
      <header className="header">
        <h1>🌱 GardenSpot</h1>
        <p>Take three pictures of your yard. We'll show you where your garden will thrive.</p>
      </header>

      {/* Step 1 — Upload photos */}
      <section className="section">
        <div className="section-title">Step 1 — Photograph your yard</div>
        <p style={{ marginBottom: 16, fontSize: '0.9rem', color: 'var(--muted)' }}>
          Walk around your yard and take one photo each in the morning, at noon, and in the afternoon.
          We'll use the shadows to map your sun and shade zones.
        </p>
        <PhotoUploader
          photos={photos}
          onPhotoUploaded={(photo) =>
            setPhotos(prev => [...prev.filter(p => p.timeOfDay !== photo.timeOfDay), photo])
          }
        />
      </section>

      {/* Step 2 — ZIP code */}
      <section className="section">
        <div className="section-title">Step 2 — Your location</div>
        <p style={{ marginBottom: 16, fontSize: '0.9rem', color: 'var(--muted)' }}>
          We'll use your ZIP code to find your USDA hardiness zone and recommend plants that survive your winters.
        </p>
        <div className="zip-row">
          <input
            type="text"
            className="zip-input"
            placeholder="ZIP code"
            maxLength={5}
            value={zip}
            onChange={e => handleZipLookup(e.target.value.replace(/\D/g, ''))}
          />
          {growZone && (
            <span className="zone-badge">Zone {growZone.zone} · {growZone.temperatureRange}</span>
          )}
        </div>
        {zoneError && <p className="error-msg">{zoneError}</p>}
      </section>

      {/* Analyze button */}
      <button
        className="analyze-btn"
        onClick={handleAnalyze}
        disabled={!canAnalyze}
      >
        {loading ? 'Analyzing your yard…' : 'Analyze My Yard →'}
      </button>
      {!allPhotosUploaded && <p style={{ textAlign: 'center', marginTop: 8, fontSize: '0.8rem', color: 'var(--muted)' }}>Upload all 3 photos to continue</p>}
      {!growZone && allPhotosUploaded && <p style={{ textAlign: 'center', marginTop: 8, fontSize: '0.8rem', color: 'var(--muted)' }}>Enter your ZIP code to continue</p>}
      {error && <p className="error-msg" style={{ textAlign: 'center', marginTop: 8 }}>{error}</p>}

      {/* Results */}
      {analysis && noonPhoto && growZone && (
        <>
          <section className="section" style={{ marginTop: 40 }}>
            <div className="section-title">Your Sun Zones</div>
            <p className="summary-card">{analysis.summary}</p>
            <ZoneOverlay photoUrl={noonPhoto.url} zones={analysis.zones} />
          </section>

          <section className="section">
            <div className="section-title">What to Plant</div>
            <PlantRecommendations zones={analysis.zones} growZone={growZone} />
          </section>
        </>
      )}
    </main>
  )
}
