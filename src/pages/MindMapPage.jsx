import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function MindMapPage() {
  const { chapterSlug } = useParams()
  const navigate = useNavigate()
  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 2000, height: 1600 })

  // Load image and set up dimensions
  useEffect(() => {
    const img = imageRef.current
    if (!img) return

    const handleImageLoad = () => {
      setImageSize({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
      setIsReady(true)
    }

    img.addEventListener('load', handleImageLoad)
    
    // If image is already loaded
    if (img.complete) {
      handleImageLoad()
    }

    return () => {
      img.removeEventListener('load', handleImageLoad)
    }
  }, [])

  // Calculate initial scale to fit image in viewport
  useEffect(() => {
    if (!containerRef.current || !isReady) return

    const calculateFit = () => {
      const container = containerRef.current
      if (!container) return

      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      // Calculate scale to fit both width and height with generous padding
      const scaleX = containerWidth / imageSize.width
      const scaleY = containerHeight / imageSize.height
      const initialScale = Math.min(scaleX, scaleY) * 0.75 // 75% to ensure everything fits with padding

      setScale(initialScale)
      // Center the image with proper padding
      const scaledWidth = imageSize.width * initialScale
      const scaledHeight = imageSize.height * initialScale
      setPan({
        x: (containerWidth - scaledWidth) / 2,
        y: (containerHeight - scaledHeight) / 2
      })
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(calculateFit, 100)
    
    // Also recalculate on window resize
    window.addEventListener('resize', calculateFit)
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', calculateFit)
    }
  }, [isReady, imageSize])

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(3, scale * delta))
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // Zoom towards mouse position
      const scaleChange = newScale / scale
      setPan({
        x: mouseX - (mouseX - pan.x) * scaleChange,
        y: mouseY - (mouseY - pan.y) * scaleChange
      })
    }
    
    setScale(newScale)
  }

  // Mouse drag pan
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDownload = () => {
    const img = imageRef.current
    if (!img) return

    const link = document.createElement('a')
    link.download = 'mindmap-how-the-state-government-works.png'
    link.href = img.src
    link.click()
  }

  const resetView = () => {
    if (!containerRef.current) return
    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const scaleX = containerWidth / imageSize.width
    const scaleY = containerHeight / imageSize.height
    const initialScale = Math.min(scaleX, scaleY) * 0.75

    const scaledWidth = imageSize.width * initialScale
    const scaledHeight = imageSize.height * initialScale
    setScale(initialScale)
    setPan({
      x: (containerWidth - scaledWidth) / 2,
      y: (containerHeight - scaledHeight) / 2
    })
  }

  return (
    <div className="mindmap-page">
      <div className="mindmap-page-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Mind Map: How the State Government Works</h1>
        <div className="mindmap-controls">
          <button onClick={resetView} className="reset-button">
            Reset View
          </button>
          <button onClick={handleDownload} className="download-button" disabled={!isReady}>
            Download Mindmap
          </button>
        </div>
      </div>
      <div 
        ref={containerRef}
        className="mindmap-page-content"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          className="mindmap-canvas-wrapper"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          <img 
            ref={imageRef}
            src="/mindmap.png" 
            alt="Mind Map: How the State Government Works"
            className="mindmap-canvas-full"
            style={{
              width: imageSize.width,
              height: imageSize.height,
              display: 'block'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default MindMapPage
