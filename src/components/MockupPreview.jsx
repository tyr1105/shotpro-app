import { useMemo } from 'react'

/**
 * Device frame configurations used for CSS-drawn mockups.
 * Each device defines its dimensions, bezel width, corner radius, and special features.
 */
const DEVICE_SPECS = {
  iphone15: {
    width: 280,
    height: 570,
    bezel: 12,
    radius: 36,
    hasNotch: true,
    cameraBar: false,
    screenRadius: 32,
    aspectLabel: '9:19.5',
  },
  macbook: {
    width: 460,
    height: 310,
    bezel: 10,
    radius: 8,
    hasNotch: false,
    cameraBar: false,
    screenRadius: 6,
    hasBase: true,
    aspectLabel: '3:2',
  },
  ipad: {
    width: 380,
    height: 500,
    bezel: 14,
    radius: 20,
    hasNotch: false,
    cameraBar: false,
    screenRadius: 14,
    aspectLabel: '4:3',
  },
  pixel8: {
    width: 270,
    height: 560,
    bezel: 8,
    radius: 28,
    hasNotch: false,
    cameraBar: true,
    screenRadius: 24,
    aspectLabel: '9:19',
  },
}

/**
 * MockupPreview renders a live preview of the device mockup with the uploaded
 * screenshot, background, and text overlays. Device frames are drawn entirely
 * with CSS (no SVG images).
 *
 * Props:
 *   uploadedImage  – data-URL of the user's screenshot (or null)
 *   selectedDevice – key from DEVICE_SPECS ('iphone15' | 'macbook' | 'ipad' | 'pixel8')
 *   bgType         – 'gradient' | 'solid' | 'image'
 *   bgColor1       – first gradient colour
 *   bgColor2       – second gradient colour
 *   solidColor     – solid background colour
 *   bgImage        – data-URL for background image (used when bgType === 'image')
 *   titleText      – headline text rendered above the device
 *   subtitleText   – secondary text rendered below the title
 *   fontFamily     – CSS font-family string
 *   titleColor     – colour for title & subtitle text
 */
export default function MockupPreview({
  uploadedImage,
  selectedDevice = 'iphone15',
  bgType = 'gradient',
  bgColor1 = '#7c5cff',
  bgColor2 = '#2d1b69',
  solidColor = '#1a1a2f',
  bgImage = null,
  titleText = '',
  subtitleText = '',
  fontFamily = "'Inter', sans-serif",
  titleColor = '#ffffff',
}) {
  const spec = DEVICE_SPECS[selectedDevice] || DEVICE_SPECS.iphone15

  // Build the background style object
  const backgroundStyle = useMemo(() => {
    switch (bgType) {
      case 'gradient':
        return { background: `linear-gradient(135deg, ${bgColor1}, ${bgColor2})` }
      case 'solid':
        return { background: solidColor }
      case 'image':
        if (bgImage) {
          return {
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }
        }
        return { background: '#0a0a0f' }
      default:
        return { background: '#0a0a0f' }
    }
  }, [bgType, bgColor1, bgColor2, solidColor, bgImage])

  // ─── Sub-components ────────────────────────────────────────────────────

  /** Dynamic Island / notch for iPhone 15 */
  const Notch = () => (
    <div style={styles.notch(spec)}>
      <div style={styles.notchCamera} />
    </div>
  )

  /** Camera bar on back of Pixel 8 (rendered as thin line at top of screen) */
  const CameraBar = () => (
    <div style={styles.cameraBar(spec)}>
      <div style={styles.cameraDot} />
    </div>
  )

  /** MacBook base / keyboard area below the screen */
  const MacBookBase = () => (
    <div style={styles.macBase(spec)}>
      <div style={styles.macTrackpad} />
      <div style={styles.macNotchScreen} />
    </div>
  )

  /** The screen area containing either the uploaded image or a placeholder */
  const Screen = () => (
    <div style={styles.screen(spec)}>
      {uploadedImage ? (
        <img
          src={uploadedImage}
          alt="Screenshot"
          style={styles.screenshot}
          draggable={false}
        />
      ) : (
        <div style={styles.placeholder}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity={0.35}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span style={{ marginTop: 8, fontSize: 12, opacity: 0.4 }}>Upload a screenshot to preview</span>
        </div>
      )}
    </div>
  )

  // ─── Main render ──────────────────────────────────────────────────────
  return (
    <div style={styles.canvas(backgroundStyle)} className="mockup-preview-canvas">
      {/* Text overlay */}
      {(titleText || subtitleText) && (
        <div style={styles.textOverlay(fontFamily)}>
          {titleText && (
            <h2 style={styles.title(titleColor)}>{titleText}</h2>
          )}
          {subtitleText && (
            <p style={styles.subtitle(titleColor)}>{subtitleText}</p>
          )}
        </div>
      )}

      {/* Device frame */}
      <div style={styles.deviceWrapper(spec)}>
        {/* Outer bezel */}
        <div style={styles.bezel(spec)}>
          {/* Notch (iPhone 15) */}
          {spec.hasNotch && <Notch />}

          {/* Screen area */}
          <div style={styles.screenClip(spec)}>
            <Screen />
            {/* Camera bar overlay (Pixel 8) */}
            {spec.cameraBar && <CameraBar />}
          </div>
        </div>

        {/* MacBook base */}
        {spec.hasBase && <MacBookBase />}
      </div>
    </div>
  )
}

// ─── Inline styles ─────────────────────────────────────────────────────────

const styles = {
  canvas: (bg) => ({
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 12,
    ...bg,
  }),

  textOverlay: (fontFamily) => ({
    position: 'absolute',
    top: '8%',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: 2,
    fontFamily,
    pointerEvents: 'none',
  }),

  title: (color) => ({
    color,
    fontSize: 'clamp(18px, 3.5vw, 42px)',
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    textShadow: '0 2px 12px rgba(0,0,0,0.4)',
  }),

  subtitle: (color) => ({
    color,
    fontSize: 'clamp(12px, 2vw, 22px)',
    fontWeight: 400,
    opacity: 0.75,
    marginTop: 6,
    textShadow: '0 1px 8px rgba(0,0,0,0.3)',
  }),

  deviceWrapper: (spec) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
  }),

  bezel: (spec) => ({
    position: 'relative',
    width: spec.width + spec.bezel * 2,
    height: spec.hasBase ? spec.height : spec.height + spec.bezel * 2,
    background: '#111',
    borderRadius: spec.radius + spec.bezel,
    padding: spec.bezel,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)',
  }),

  screenClip: (spec) => ({
    position: 'relative',
    width: spec.width,
    height: spec.hasBase ? spec.height - 20 : spec.height,
    borderRadius: spec.screenRadius,
    overflow: 'hidden',
    background: '#000',
    flexShrink: 0,
  }),

  screen: (spec) => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
  }),

  screenshot: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },

  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    opacity: 0.5,
  },

  // ── iPhone Notch ──
  notch: (spec) => ({
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: spec.width * 0.32,
    height: 26,
    background: '#111',
    borderRadius: '0 0 16px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  }),

  notchCamera: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#1a1a2e',
    border: '1.5px solid #2a2a4a',
  },

  // ── Pixel 8 Camera bar ──
  cameraBar: (spec) => ({
    position: 'absolute',
    top: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: spec.width * 0.7,
    height: 20,
    borderRadius: 10,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  }),

  cameraDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#222',
    border: '1px solid #333',
  },

  // ── MacBook base ──
  macBase: (spec) => ({
    width: spec.width + spec.bezel * 2 + 40,
    height: 18,
    background: 'linear-gradient(to bottom, #ccc, #aaa)',
    borderRadius: '0 0 8px 8px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    marginTop: -1,
  }),

  macTrackpad: {
    width: 80,
    height: 6,
    borderRadius: 3,
    background: 'rgba(0,0,0,0.15)',
  },

  macNotchScreen: {
    position: 'absolute',
    top: -1,
    left: '50%',
    transform: 'translateX(-50%)',
    width: spec.width + spec.bezel * 2,
    height: 2,
    background: '#888',
    borderRadius: '0 0 1px 1px',
  },
}

export { DEVICE_SPECS }
