import { useState, useCallback } from 'react'
import { extractColors } from '../lib/colorExtractor'
import { isValidHexColor, normalizeHexColor } from '../lib/validation'

function computePosition(existingCount) {
  const CARD_W = 380
  const CARD_H = 260
  const GAP = 30
  const COLS = 3
  const col = existingCount % COLS
  const row = Math.floor(existingCount / COLS)
  return {
    x: 40 + col * (CARD_W + GAP),
    y: 40 + row * (CARD_H + GAP),
    width: CARD_W,
    height: CARD_H,
  }
}

function deduplicateColors(colors) {
  const seen = new Set()
  return colors.filter(c => {
    const key = `${Math.round(c.hsl.h / 15)}-${Math.round(c.hsl.s / 15)}-${Math.round(c.hsl.l / 15)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function useEditorState(state, setState) {
  const [selectedId, setSelectedId] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [isPlacingVisual, setIsPlacingVisual] = useState(false)
  const [pendingVisualSpec, setPendingVisualSpec] = useState(null)

  const update = useCallback((partial) => {
    setState(prev => ({ ...prev, ...partial }))
  }, [setState])

  // --- Screenshot callbacks ---
  const addScreenshots = useCallback((files) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()
      reader.onload = (e) => {
        setState(prev => {
          const pos = computePosition(prev.screenshots.length)
          return {
            ...prev,
            screenshots: [...prev.screenshots, {
              id: crypto.randomUUID(),
              dataUrl: e.target.result,
              name: file.name,
              addedAt: Date.now(),
              x: pos.x,
              y: pos.y,
              width: pos.width,
              height: pos.height,
              zIndex: Date.now(),
            }]
          }
        })
      }
      reader.onerror = () => console.error('[App] Failed to read:', file.name)
      reader.readAsDataURL(file)
    }
  }, [setState])

  const updateScreenshot = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      screenshots: prev.screenshots.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }))
  }, [setState])

  const analyzeScreenshot = useCallback(async (screenshot) => {
    setAnalyzing(true)
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = screenshot.dataUrl
      })
      const colors = extractColors(img)
      setState(prev => ({
        ...prev,
        screenshots: prev.screenshots.map(s =>
          s.id === screenshot.id
            ? { ...s, extractedPalette: deduplicateColors(colors) }
            : s
        ),
      }))
      setSelectedId(screenshot.id)
    } catch (e) {
      console.error('[App] analyzeScreenshot failed:', e)
    } finally {
      setAnalyzing(false)
    }
  }, [setState])

  const removeScreenshot = useCallback((id) => {
    if (!window.confirm('Remove this screenshot from the canvas?')) return
    setState(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter(s => s.id !== id)
    }))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId, setState])

  // --- Visual callbacks ---
  const addVisual = useCallback((visual) => {
    setState(prev => ({ ...prev, visuals: [...prev.visuals, visual] }))
  }, [setState])

  const updateVisual = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      visuals: prev.visuals.map(v => v.id === id ? { ...v, ...updates } : v),
    }))
  }, [setState])

  const removeVisual = useCallback((id) => {
    if (!window.confirm('Delete this visual?')) return
    setState(prev => ({
      ...prev,
      visuals: prev.visuals.filter(v => v.id !== id),
    }))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId, setState])

  // --- Gemini visual placement ---
  const handleGeminiGenerate = useCallback((spec, description) => {
    setPendingVisualSpec({ spec, description })
    setIsPlacingVisual(true)
  }, [])

  const handlePlaceVisual = useCallback((canvasX, canvasY) => {
    if (!pendingVisualSpec) return
    const visual = {
      id: crypto.randomUUID(),
      spec: pendingVisualSpec.spec,
      description: pendingVisualSpec.description,
      name: pendingVisualSpec.spec.title || pendingVisualSpec.description,
      status: 'ready',
      x: canvasX,
      y: canvasY,
      width: 400,
      height: 280,
      zIndex: Date.now(),
    }
    addVisual(visual)
    setIsPlacingVisual(false)
    setPendingVisualSpec(null)
  }, [pendingVisualSpec, addVisual])

  const handleCancelPlace = useCallback(() => {
    setIsPlacingVisual(false)
    setPendingVisualSpec(null)
  }, [])

  // --- Color/palette operations ---
  const removeColor = useCallback((hex) => {
    setState(prev => {
      const selectedScreenshot = selectedId ? prev.screenshots.find(s => s.id === selectedId) : null
      if (selectedScreenshot?.extractedPalette) {
        return {
          ...prev,
          screenshots: prev.screenshots.map(s =>
            s.id === selectedId
              ? { ...s, extractedPalette: s.extractedPalette.filter(c => c.hex !== hex) }
              : s
          ),
        }
      }
      return { ...prev, palette: prev.palette.filter(c => c.hex !== hex) }
    })
  }, [selectedId, setState])

  const addColorManually = useCallback((hex) => {
    if (!isValidHexColor(hex)) return
    hex = normalizeHexColor(hex)
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const rn = r / 255, gn = g / 255, bn = b / 255
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
    let h = 0, s = 0
    const l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
      else if (max === gn) h = ((bn - rn) / d + 2) / 6
      else h = ((rn - gn) / d + 4) / 6
    }
    const newColor = {
      hex,
      rgb: { r, g, b },
      hsl: { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
    }
    setState(prev => {
      const selectedScreenshot = selectedId ? prev.screenshots.find(s => s.id === selectedId) : null
      if (selectedScreenshot?.extractedPalette) {
        return {
          ...prev,
          screenshots: prev.screenshots.map(s =>
            s.id === selectedId
              ? { ...s, extractedPalette: deduplicateColors([...s.extractedPalette, newColor]) }
              : s
          ),
        }
      }
      return { ...prev, palette: deduplicateColors([...prev.palette, newColor]) }
    })
  }, [selectedId, setState])

  // --- Derived palette state ---
  const selectedScreenshot = selectedId ? state.screenshots.find(s => s.id === selectedId) : null
  const activePalette = selectedScreenshot?.extractedPalette || state.palette
  const activePaletteLabel = selectedScreenshot?.extractedPalette
    ? `${selectedScreenshot.name || 'Screenshot'}`
    : null

  const designSystem = {
    name: state.name,
    colors: activePalette,
    fonts: state.fonts,
    background: state.background,
    formatRules: state.formatRules,
    sentinels: state.sentinels
  }

  return {
    selectedId,
    setSelectedId,
    analyzing,
    isPlacingVisual,
    update,
    addScreenshots,
    updateScreenshot,
    analyzeScreenshot,
    removeScreenshot,
    addVisual,
    updateVisual,
    removeVisual,
    handleGeminiGenerate,
    handlePlaceVisual,
    handleCancelPlace,
    removeColor,
    addColorManually,
    activePalette,
    activePaletteLabel,
    designSystem,
  }
}
