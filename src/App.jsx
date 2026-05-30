import { useState, useRef, useCallback, useEffect } from 'react'
import './App.css'

// ─── i18n ────────────────────────────────────────────────────────────────────
const i18n = {
  zh: {
    brand: 'ShotPro',
    upload: '上传截图',
    uploadHint: '点击或拖拽图片到此处',
    device: '设备选择',
    background: '背景设置',
    gradient: '渐变色',
    solid: '纯色',
    image: '背景图',
    textSettings: '文字设置',
    title: '标题文字',
    subtitle: '副标题',
    font: '字体',
    titleColor: '标题颜色',
    exportOptions: '导出选项',
    exportSize: '导出尺寸',
    exportBtn: '导出图片',
    preview: '实时预览',
    noImage: '请上传截图以预览',
    appstore: 'App Store (1290×2796)',
    playstore: 'Play Store (1080×1920)',
    social: '社交媒体 (1200×630)',
    custom: '自定义',
    bgImage: '背景图片',
    deviceNames: {
      iphone15: 'iPhone 15 Pro',
      macbook: 'MacBook Pro',
      ipad: 'iPad Pro',
      pixel8: 'Pixel 8',
    },
    langSwitch: 'EN',
    footerText: 'ShotPro — 应用商店截图生成器',
    dragActive: '释放以上传图片',
    resetBtn: '重置',
  },
  en: {
    brand: 'ShotPro',
    upload: 'Upload Screenshot',
    uploadHint: 'Click or drag image here',
    device: 'Device',
    background: 'Background',
    gradient: 'Gradient',
    solid: 'Solid',
    image: 'Image',
    textSettings: 'Text Settings',
    title: 'Title Text',
    subtitle: 'Subtitle',
    font: 'Font',
    titleColor: 'Title Color',
    exportOptions: 'Export Options',
    exportSize: 'Export Size',
    exportBtn: 'Export Image',
    preview: 'Live Preview',
    noImage: 'Upload a screenshot to preview',
    appstore: 'App Store (1290×2796)',
    playstore: 'Play Store (1080×1920)',
    social: 'Social Media (1200×630)',
    custom: 'Custom',
    bgImage: 'Background Image',
    deviceNames: {
      iphone15: 'iPhone 15 Pro',
      macbook: 'MacBook Pro',
      ipad: 'iPad Pro',
      pixel8: 'Pixel 8',
    },
    langSwitch: '中文',
    footerText: 'ShotPro — App Store Screenshot Generator',
    dragActive: 'Drop to upload',
    resetBtn: 'Reset',
  },
}

// ─── Device mockup dimensions (aspect ratios for preview) ────────────────────
const DEVICE_CONFIG = {
  iphone15: { w: 280, h: 570, bezel: 12, notch: true, radius: 36 },
  macbook:  { w: 460, h: 310, bezel: 10, notch: false, radius: 8 },
  ipad:     { w: 380, h: 500, bezel: 14, notch: false, radius: 20 },
  pixel8:   { w: 270, h: 560, bezel: 8,  notch: false, radius: 28 },
}

const EXPORT_SIZES = {
  appstore:  { w: 1290, h: 2796 },
  playstore: { w: 1080, h: 1920 },
  social:    { w: 1200, h: 630 },
  custom:    { w: 1080, h: 1920 },
}

const FONT_OPTIONS = [
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'SF Pro Display', -apple-system, sans-serif", label: 'SF Pro' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'PingFang SC', 'Microsoft YaHei', sans-serif", label: 'PingFang SC' },
  { value: "Georgia, serif", label: 'Georgia' },
]

// ─── Icons (inline SVG) ──────────────────────────────────────────────────────
const IconUpload = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const IconDownload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="3" /><line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" /></svg>
)

const IconLaptop = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="12" rx="2" /><line x1="2" y1="20" x2="22" y2="20" /></svg>
)

const IconTablet = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" /></svg>
)

const IconAndroid = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="3" /><line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" /><line x1="5" y1="5" x2="19" y2="5" /></svg>
)

const IconImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
)

const IconReset = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
)

// ─── App Component ───────────────────────────────────────────────────────────
function App() {
  // State
  const [uploadedImage, setUploadedImage]       = useState(null)
  const [selectedDevice, setSelectedDevice]     = useState('iphone15')
  const [bgType, setBgType]                     = useState('gradient')
  const [bgColor1, setBgColor1]                 = useState('#7c5cff')
  const [bgColor2, setBgColor2]                 = useState('#2d1b69')
  const [solidColor, setSolidColor]             = useState('#1a1a2f')
  const [bgImage, setBgImage]                   = useState(null)
  const [titleText, setTitleText]               = useState('ShotPro')
  const [subtitleText, setSubtitleText]         = useState('')
  const [fontFamily, setFontFamily]             = useState(FONT_OPTIONS[0].value)
  const [titleColor, setTitleColor]             = useState('#ffffff')
  const [exportSize, setExportSize]             = useState('appstore')
  const [language, setLanguage]                 = useState('zh')
  const [isDragOver, setIsDragOver]             = useState(false)

  const fileInputRef   = useRef(null)
  const bgImageInputRef = useRef(null)
  const canvasRef      = useRef(null)

  const t = i18n[language]

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setUploadedImage(ev.target.result)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setUploadedImage(ev.target.result)
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleBgImageChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setBgImage(ev.target.result)
    reader.readAsDataURL(file)
  }, [])

  const handleReset = useCallback(() => {
    setUploadedImage(null)
    setSelectedDevice('iphone15')
    setBgType('gradient')
    setBgColor1('#7c5cff')
    setBgColor2('#2d1b69')
    setSolidColor('#1a1a2f')
    setBgImage(null)
    setTitleText('ShotPro')
    setSubtitleText('')
    setFontFamily(FONT_OPTIONS[0].value)
    setTitleColor('#ffffff')
    setExportSize('appstore')
  }, [])

  // ─── Export via off-screen canvas ─────────────────────────────────────────
  const handleExport = useCallback(() => {
    const size = EXPORT_SIZES[exportSize]
    const canvas = document.createElement('canvas')
    canvas.width = size.w
    canvas.height = size.h
    const ctx = canvas.getContext('2d')

    // Background
    if (bgType === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, size.w, size.h)
      grad.addColorStop(0, bgColor1)
      grad.addColorStop(1, bgColor2)
      ctx.fillStyle = grad
    } else if (bgType === 'solid') {
      ctx.fillStyle = solidColor
    } else {
      ctx.fillStyle = '#0a0a0f'
    }
    ctx.fillRect(0, 0, size.w, size.h)

    // Background image if set
    if (bgType === 'image' && bgImage) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size.w, size.h)
        drawDeviceAndText(ctx, size)
        triggerDownload(canvas)
      }
      img.src = bgImage
      return
    }

    drawDeviceAndText(ctx, size)
    triggerDownload(canvas)
  }, [uploadedImage, selectedDevice, bgType, bgColor1, bgColor2, solidColor, bgImage, titleText, subtitleText, fontFamily, titleColor, exportSize])

  const drawDeviceAndText = (ctx, size) => {
    // Title text
    if (titleText) {
      const titleFontSize = Math.round(size.h * 0.045)
      ctx.font = `bold ${titleFontSize}px ${fontFamily}`
      ctx.fillStyle = titleColor
      ctx.textAlign = 'center'
      ctx.fillText(titleText, size.w / 2, size.h * 0.1)

      // Subtitle
      if (subtitleText) {
        const subFontSize = Math.round(size.h * 0.025)
        ctx.font = `${subFontSize}px ${fontFamily}`
        ctx.globalAlpha = 0.7
        ctx.fillText(subtitleText, size.w / 2, size.h * 0.15)
        ctx.globalAlpha = 1.0
      }
    }

    // Device screenshot
    if (uploadedImage) {
      const img = new Image()
      img.onload = () => {
        const devConf = DEVICE_CONFIG[selectedDevice]
        const maxDevW = size.w * 0.6
        const maxDevH = size.h * 0.7
        const aspect = devConf.w / devConf.h
        let dw, dh
        if (aspect > maxDevW / maxDevH) {
          dw = maxDevW
          dh = maxDevW / aspect
        } else {
          dh = maxDevH
          dw = maxDevH * aspect
        }
        const dx = (size.w - dw) / 2
        const dy = size.h * 0.22

        // Device bezel
        const b = devConf.bezel * (dw / devConf.w)
        const r = devConf.radius * (dw / devConf.w)

        // Draw bezel shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)'
        ctx.shadowBlur = 30
        ctx.shadowOffsetY = 10
        ctx.fillStyle = '#111'
        roundRect(ctx, dx - b, dy - b, dw + b * 2, dh + b * 2, r + b)
        ctx.fill()
        ctx.shadowColor = 'transparent'

        // Clip and draw screenshot
        ctx.save()
        roundRect(ctx, dx, dy, dw, dh, r)
        ctx.clip()
        ctx.drawImage(img, dx, dy, dw, dh)
        ctx.restore()

        // Notch
        if (devConf.notch) {
          const nw = dw * 0.3
          const nh = dh * 0.03
          const nx = dx + (dw - nw) / 2
          ctx.fillStyle = '#111'
          roundRect(ctx, nx, dy - b / 2, nw, nh + b, 8)
          ctx.fill()
        }

        triggerDownload(ctx.canvas)
      }
      img.src = uploadedImage
    } else {
      triggerDownload(ctx.canvas)
    }
  }

  const triggerDownload = (canvas) => {
    const link = document.createElement('a')
    link.download = `shotpro-${exportSize}-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // ─── Computed ─────────────────────────────────────────────────────────────
  const bgStyle = (() => {
    if (bgType === 'gradient') return { background: `linear-gradient(135deg, ${bgColor1}, ${bgColor2})` }
    if (bgType === 'solid') return { background: solidColor }
    if (bgType === 'image' && bgImage) return { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    return { background: '#0a0a0f' }
  })()

  const dev = DEVICE_CONFIG[selectedDevice]

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="sp-app">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sp-header">
        <div className="sp-header__brand">
          <div className="sp-header__logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#7c5cff" />
              <path d="M8 8h12v4l-6 8-6-8V8z" fill="#fff" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 className="sp-header__title">{t.brand}</h1>
        </div>
        <div className="sp-header__actions">
          <button className="sp-header__lang" onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}>
            {t.langSwitch}
          </button>
        </div>
      </header>

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <main className="sp-main">

        {/* ── Left Panel: Controls ──────────────────────────────────────── */}
        <aside className="sp-panel sp-panel--left">
          {/* Upload */}
          <section className="sp-section">
            <h3 className="sp-section__title">{t.upload}</h3>
            <div
              className={`sp-upload${isDragOver ? ' sp-upload--active' : ''}${uploadedImage ? ' sp-upload--has-image' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {uploadedImage ? (
                <img src={uploadedImage} alt="Screenshot preview" className="sp-upload__preview" />
              ) : (
                <div className="sp-upload__placeholder">
                  <IconUpload />
                  <span>{isDragOver ? t.dragActive : t.uploadHint}</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sp-upload__input"
              />
            </div>
          </section>

          {/* Device Selection */}
          <section className="sp-section">
            <h3 className="sp-section__title">{t.device}</h3>
            <div className="sp-device-grid">
              {[
                { key: 'iphone15', icon: <IconPhone />, label: t.deviceNames.iphone15 },
                { key: 'macbook',  icon: <IconLaptop />, label: t.deviceNames.macbook },
                { key: 'ipad',     icon: <IconTablet />, label: t.deviceNames.ipad },
                { key: 'pixel8',   icon: <IconAndroid />, label: t.deviceNames.pixel8 },
              ].map((d) => (
                <button
                  key={d.key}
                  className={`sp-device-btn${selectedDevice === d.key ? ' sp-device-btn--active' : ''}`}
                  onClick={() => setSelectedDevice(d.key)}
                  title={d.label}
                >
                  {d.icon}
                  <span>{d.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Background */}
          <section className="sp-section">
            <h3 className="sp-section__title">{t.background}</h3>
            <div className="sp-bg-tabs">
              {['gradient', 'solid', 'image'].map((type) => (
                <button
                  key={type}
                  className={`sp-bg-tab${bgType === type ? ' sp-bg-tab--active' : ''}`}
                  onClick={() => setBgType(type)}
                >
                  {t[type]}
                </button>
              ))}
            </div>
            <div className="sp-bg-controls">
              {bgType === 'gradient' && (
                <div className="sp-color-row">
                  <label className="sp-color-field">
                    <span>1</span>
                    <input type="color" value={bgColor1} onChange={(e) => setBgColor1(e.target.value)} />
                  </label>
                  <label className="sp-color-field">
                    <span>2</span>
                    <input type="color" value={bgColor2} onChange={(e) => setBgColor2(e.target.value)} />
                  </label>
                </div>
              )}
              {bgType === 'solid' && (
                <label className="sp-color-field sp-color-field--full">
                  <input type="color" value={solidColor} onChange={(e) => setSolidColor(e.target.value)} />
                  <span className="sp-color-hex">{solidColor}</span>
                </label>
              )}
              {bgType === 'image' && (
                <button className="sp-bg-image-btn" onClick={() => bgImageInputRef.current?.click()}>
                  <IconImage />
                  <span>{t.bgImage}</span>
                </button>
              )}
              <input
                ref={bgImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleBgImageChange}
                className="sp-upload__input"
              />
            </div>
          </section>

          {/* Text Settings */}
          <section className="sp-section">
            <h3 className="sp-section__title">{t.textSettings}</h3>
            <div className="sp-field">
              <label className="sp-label">{t.title}</label>
              <input
                className="sp-input"
                type="text"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                placeholder={language === 'zh' ? '输入标题' : 'Enter title'}
              />
            </div>
            <div className="sp-field">
              <label className="sp-label">{t.subtitle}</label>
              <input
                className="sp-input"
                type="text"
                value={subtitleText}
                onChange={(e) => setSubtitleText(e.target.value)}
                placeholder={language === 'zh' ? '输入副标题' : 'Enter subtitle'}
              />
            </div>
            <div className="sp-field">
              <label className="sp-label">{t.font}</label>
              <select className="sp-select" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div className="sp-field">
              <label className="sp-label">{t.titleColor}</label>
              <div className="sp-color-row">
                <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} />
                <span className="sp-color-hex">{titleColor}</span>
              </div>
            </div>
          </section>
        </aside>

        {/* ── Center: Live Preview ──────────────────────────────────────── */}
        <section className="sp-preview-area">
          <div className="sp-preview-label">{t.preview}</div>
          <div className="sp-preview-canvas" style={bgStyle}>
            {/* Title / Subtitle overlay */}
            {(titleText || subtitleText) && (
              <div className="sp-preview-text" style={{ fontFamily }}>
                {titleText && (
                  <h2 className="sp-preview-title" style={{ color: titleColor }}>
                    {titleText}
                  </h2>
                )}
                {subtitleText && (
                  <p className="sp-preview-subtitle" style={{ color: titleColor }}>
                    {subtitleText}
                  </p>
                )}
              </div>
            )}

            {/* Device mockup */}
            <div className="sp-device-mockup" style={{ width: dev.w, height: dev.h }}>
              {/* Bezel */}
              <div
                className="sp-device-bezel"
                style={{
                  borderRadius: dev.radius + dev.bezel,
                  padding: dev.bezel,
                }}
              >
                {/* Notch */}
                {dev.notch && (
                  <div className="sp-device-notch" style={{ width: dev.w * 0.3, height: dev.h * 0.025 }} />
                )}
                {/* Screen */}
                <div className="sp-device-screen" style={{ borderRadius: dev.radius }}>
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Screenshot" className="sp-device-screenshot" />
                  ) : (
                    <div className="sp-device-placeholder">
                      <span>{t.noImage}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Right Panel: Export ────────────────────────────────────────── */}
        <aside className="sp-panel sp-panel--right">
          <section className="sp-section">
            <h3 className="sp-section__title">{t.exportOptions}</h3>
            <div className="sp-field">
              <label className="sp-label">{t.exportSize}</label>
              <select className="sp-select" value={exportSize} onChange={(e) => setExportSize(e.target.value)}>
                <option value="appstore">{t.appstore}</option>
                <option value="playstore">{t.playstore}</option>
                <option value="social">{t.social}</option>
                <option value="custom">{t.custom}</option>
              </select>
            </div>
            {exportSize === 'custom' && (
              <p className="sp-hint">
                {language === 'zh' ? '默认 1080×1920，可在代码中修改' : 'Default 1080×1920, editable in code'}
              </p>
            )}
          </section>

          <button className="sp-export-btn" onClick={handleExport} disabled={!uploadedImage}>
            <IconDownload />
            <span>{t.exportBtn}</span>
          </button>

          <button className="sp-reset-btn" onClick={handleReset}>
            <IconReset />
            <span>{t.resetBtn}</span>
          </button>

          {/* Quick tips */}
          <section className="sp-section sp-section--tips">
            <div className="sp-tips">
              <p>
                {language === 'zh'
                  ? '💡 提示：上传应用截图，选择设备和背景，即可一键生成精美的应用商店展示图。'
                  : '💡 Tip: Upload a screenshot, choose device & background, then export a polished mockup.'}
              </p>
            </div>
          </section>
        </aside>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="sp-footer">
        <span>{t.footerText}</span>
      </footer>
    </div>
  )
}

// ─── Utility: rounded rect path ──────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export default App
