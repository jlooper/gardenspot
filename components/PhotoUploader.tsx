'use client'
import { CldUploadWidget } from 'next-cloudinary'
import { UploadedPhoto, TimeOfDay } from '@/lib/types'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'gardenspot'
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY

interface Props {
  photos: UploadedPhoto[]
  onPhotoUploaded: (photo: UploadedPhoto) => void
}

/** Cloudinary’s upload widget often sets `body { overflow: hidden }` while open; restore after close. */
function restorePageScroll() {
  if (typeof document === 'undefined') return
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('position')
  document.body.style.removeProperty('width')
}

const SLOTS: { time: TimeOfDay; icon: string; label: string; sub: string }[] = [
  { time: 'morning',   icon: '🌅', label: 'Morning',   sub: '8–10 AM'      },
  { time: 'noon',      icon: '☀️', label: 'Noon',      sub: '11 AM–1 PM'   },
  { time: 'afternoon', icon: '🌇', label: 'Afternoon', sub: '3–5 PM'       },
]

export default function PhotoUploader({ photos, onPhotoUploaded }: Props) {
  if (!CLOUD_NAME) {
    return (
      <p className="error-msg" role="alert">
        Cloudinary is not configured: set <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> in{' '}
        <code>.env.local</code> and restart the dev server.
      </p>
    )
  }

  return (
    <div className="photo-grid">
      {SLOTS.map(({ time, icon, label, sub }) => {
        const uploaded = photos.find(p => p.timeOfDay === time)
        return (
          <div key={time} className={`photo-slot${uploaded ? ' filled' : ''}`}>
            <div className="slot-header">
              <span>{icon}</span>
              <div>
                <div className="slot-title">{label}</div>
                <div className="slot-subtitle">{sub}</div>
              </div>
            </div>

            {uploaded ? (
              <div className="uploaded-preview">
                <img src={uploaded.url} alt={`${label} yard photo`} />
                <div className="check-badge">✓</div>
              </div>
            ) : (
              <CldUploadWidget
                config={{
                  cloud: {
                    cloudName: CLOUD_NAME,
                    ...(API_KEY ? { apiKey: API_KEY } : {}),
                  },
                }}
                uploadPreset={UPLOAD_PRESET}
                options={{ sources: ['local', 'camera'], maxFiles: 1, clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'] }}
                onClose={() => restorePageScroll()}
                onSuccess={(result) => {
                  restorePageScroll()
                  const info = result.info as { secure_url: string; public_id: string }
                  onPhotoUploaded({ timeOfDay: time, url: info.secure_url, publicId: info.public_id })
                }}
              >
                {({ open }) => (
                  <button className="upload-btn" onClick={() => open()}>
                    + Add {label} Photo
                  </button>
                )}
              </CldUploadWidget>
            )}
          </div>
        )
      })}
    </div>
  )
}
