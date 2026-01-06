import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function MindMapPage() {
  const { chapterSlug } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const canvasWidth = 2000
  const canvasHeight = 1600 // Increased height to accommodate top nodes

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Clear canvas with light off-white background
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.fillStyle = '#F8F9FA' // Light off-white background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Center position
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2

    // Define nodes matching the image structure
    // Central node (light blue)
    const centerNode = { 
      id: 'center', 
      label: 'How the State\nGovernment Works', 
      x: centerX, 
      y: centerY, 
      color: '#B3E5FC', // Light blue
      size: 'large',
      type: 'center'
    }

    // Four main nodes branching out
    // Top-left: Light purple
    const main1 = { 
      id: 'structure', 
      label: 'Government\nStructure', 
      x: centerX - 400, 
      y: centerY - 350, 
      color: '#E1BEE7', // Light purple
      type: 'main',
      position: 'top-left'
    }
    
    // Top-right: Light green
    const main2 = { 
      id: 'formation', 
      label: 'Formation\nProcess', 
      x: centerX + 400, 
      y: centerY - 350, 
      color: '#C5E1A5', // Light green
      type: 'main',
      position: 'top-right'
    }
    
    // Bottom-left: Darker purple
    const main3 = { 
      id: 'pillars', 
      label: 'Three\nPillars', 
      x: centerX - 400, 
      y: centerY + 350, 
      color: '#BA68C8', // Darker purple
      type: 'main',
      position: 'bottom-left'
    }
    
    // Bottom-right: Light orange/yellow
    const main4 = { 
      id: 'accountability', 
      label: 'Accountability\n& Oversight', 
      x: centerX + 400, 
      y: centerY + 350, 
      color: '#FFE082', // Light orange/yellow
      type: 'main',
      position: 'bottom-right'
    }

    // Sub-nodes for each main node (2 each)
    // Main 1 (Structure) sub-nodes
    const sub1_1 = { 
      id: 'levels', 
      label: 'Levels of\nGovernment', 
      x: centerX - 650, 
      y: centerY - 500, 
      color: '#BBDEFB', // Light blue
      type: 'sub',
      parent: 'structure'
    }
    const sub1_2 = { 
      id: 'mla', 
      label: 'MLA &\nElection', 
      x: centerX - 650, 
      y: centerY - 200, 
      color: '#F8BBD0', // Light pink
      type: 'sub',
      parent: 'structure'
    }

    // Main 2 (Formation) sub-nodes
    const sub2_1 = { 
      id: 'majority', 
      label: 'Majority\nRule', 
      x: centerX + 650, 
      y: centerY - 500, 
      color: '#F8BBD0', // Light pink
      type: 'sub',
      parent: 'formation'
    }
    const sub2_2 = { 
      id: 'coalition', 
      label: 'Coalition\nGovernment', 
      x: centerX + 650, 
      y: centerY - 200, 
      color: '#FFE082', // Light orange
      type: 'sub',
      parent: 'formation'
    }

    // Main 3 (Pillars) sub-nodes
    const sub3_1 = { 
      id: 'legislature', 
      label: 'Legislature\nMakes Laws', 
      x: centerX - 650, 
      y: centerY + 200, 
      color: '#FFF59D', // Yellow
      type: 'sub',
      parent: 'pillars'
    }
    const sub3_2 = { 
      id: 'executive', 
      label: 'Executive\nImplements', 
      x: centerX - 650, 
      y: centerY + 500, 
      color: '#B2DFDB', // Light teal
      type: 'sub',
      parent: 'pillars'
    }

    // Main 4 (Accountability) sub-nodes
    const sub4_1 = { 
      id: 'debate', 
      label: 'Legislative\nDebate', 
      x: centerX + 650, 
      y: centerY + 200, 
      color: '#FFAB91', // Light red/coral
      type: 'sub',
      parent: 'accountability'
    }
    const sub4_2 = { 
      id: 'media', 
      label: 'Media &\nPress', 
      x: centerX + 650, 
      y: centerY + 500, 
      color: '#E1BEE7', // Light purple
      type: 'sub',
      parent: 'accountability'
    }

    const nodes = [
      centerNode,
      main1, main2, main3, main4,
      sub1_1, sub1_2,
      sub2_1, sub2_2,
      sub3_1, sub3_2,
      sub4_1, sub4_2
    ]

    // Define edges (connections)
    const edges = [
      { from: 'center', to: 'structure' },
      { from: 'center', to: 'formation' },
      { from: 'center', to: 'pillars' },
      { from: 'center', to: 'accountability' },
      { from: 'structure', to: 'levels' },
      { from: 'structure', to: 'mla' },
      { from: 'formation', to: 'majority' },
      { from: 'formation', to: 'coalition' },
      { from: 'pillars', to: 'legislature' },
      { from: 'pillars', to: 'executive' },
      { from: 'accountability', to: 'debate' },
      { from: 'accountability', to: 'media' }
    ]

    const getNodeById = (id) => nodes.find(n => n.id === id)

    // Helper function to draw hand-drawn style arrow
    const drawHandDrawnArrow = (fromX, fromY, toX, toY) => {
      // Calculate direction
      const dx = toX - fromX
      const dy = toY - fromY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx)
      
      // Add slight wobble for hand-drawn effect
      const wobble = 3
      const midX = (fromX + toX) / 2 + (Math.random() - 0.5) * wobble
      const midY = (fromY + toY) / 2 + (Math.random() - 0.5) * wobble
      
      // Draw line with slight curve
      ctx.strokeStyle = '#000000' // Black arrows
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.quadraticCurveTo(midX, midY, toX - Math.cos(angle) * 15, toY - Math.sin(angle) * 15)
      ctx.stroke()
      
      // Draw arrowhead
      const arrowLength = 12
      const arrowWidth = 8
      const arrowAngle = Math.PI / 6
      
      ctx.beginPath()
      ctx.moveTo(toX, toY)
      ctx.lineTo(
        toX - arrowLength * Math.cos(angle - arrowAngle),
        toY - arrowLength * Math.sin(angle - arrowAngle)
      )
      ctx.lineTo(
        toX - arrowLength * Math.cos(angle + arrowAngle),
        toY - arrowLength * Math.sin(angle + arrowAngle)
      )
      ctx.closePath()
      ctx.fillStyle = '#000000'
      ctx.fill()
    }

    // Draw edges (arrows)
    edges.forEach(edge => {
      const fromNode = getNodeById(edge.from)
      const toNode = getNodeById(edge.to)
      if (!fromNode || !toNode) return

      // Calculate connection points on node edges
      let fromX = fromNode.x
      let fromY = fromNode.y
      let toX = toNode.x
      let toY = toNode.y

      if (fromNode.type === 'center') {
        // Connect from center node edge
        const angle = Math.atan2(toY - fromY, toX - fromX)
        const radius = 80
        fromX = fromNode.x + Math.cos(angle) * radius
        fromY = fromNode.y + Math.sin(angle) * radius
      } else if (fromNode.type === 'main') {
        // Connect from main node edge
        const angle = Math.atan2(toY - fromY, toX - fromX)
        const radius = 70
        fromX = fromNode.x + Math.cos(angle) * radius
        fromY = fromNode.y + Math.sin(angle) * radius
      }

      if (toNode.type === 'main') {
        // Connect to main node edge
        const angle = Math.atan2(fromY - toY, fromX - toX)
        const radius = 70
        toX = toNode.x + Math.cos(angle) * radius
        toY = toNode.y + Math.sin(angle) * radius
      } else if (toNode.type === 'sub') {
        // Connect to sub node edge
        const angle = Math.atan2(fromY - toY, fromX - toX)
        const radius = 60
        toX = toNode.x + Math.cos(angle) * radius
        toY = toNode.y + Math.sin(angle) * radius
      }

      drawHandDrawnArrow(fromX, fromY, toX, toY)
    })

    // Draw nodes with drop shadows
    nodes.forEach(node => {
      // Draw drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 3
      ctx.shadowOffsetY = 3

      if (node.type === 'center') {
        // Central node - large rounded rectangle
        const width = 200
        const height = 100
        const radius = 15
        
        ctx.beginPath()
        ctx.roundRect(node.x - width/2 + 3, node.y - height/2 + 3, width, height, radius)
        ctx.fill()
        
        ctx.shadowColor = 'transparent'
        ctx.fillStyle = node.color
        ctx.beginPath()
        ctx.roundRect(node.x - width/2, node.y - height/2, width, height, radius)
        ctx.fill()
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.stroke()
      } else if (node.type === 'main') {
        // Main nodes - rounded rectangles
        const width = 180
        const height = 90
        const radius = 12
        
        ctx.beginPath()
        ctx.roundRect(node.x - width/2 + 3, node.y - height/2 + 3, width, height, radius)
        ctx.fill()
        
        ctx.shadowColor = 'transparent'
        ctx.fillStyle = node.color
        ctx.beginPath()
        ctx.roundRect(node.x - width/2, node.y - height/2, width, height, radius)
        ctx.fill()
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.stroke()
      } else {
        // Sub-nodes - rounded rectangles (smaller)
        const width = 160
        const height = 80
        const radius = 10
        
        ctx.beginPath()
        ctx.roundRect(node.x - width/2 + 3, node.y - height/2 + 3, width, height, radius)
        ctx.fill()
        
        ctx.shadowColor = 'transparent'
        ctx.fillStyle = node.color
        ctx.beginPath()
        ctx.roundRect(node.x - width/2, node.y - height/2, width, height, radius)
        ctx.fill()
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Node label
      ctx.fillStyle = '#000000'
      ctx.font = node.type === 'center' ? 'bold 24px Arial' : node.type === 'main' ? 'bold 18px Arial' : 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const lines = node.label.split('\n')
      lines.forEach((line, i) => {
        ctx.fillText(line, node.x, node.y - (lines.length - 1) * 10 + i * 20)
      })
    })

    // Add "CONCEPT MAP" text above central node
    ctx.fillStyle = '#64B5F6' // Slightly darker blue
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('CONCEPT MAP', centerX, centerY - 200)

    setIsReady(true)
  }, [])

  // Calculate initial scale to fit canvas in viewport
  useEffect(() => {
    if (!containerRef.current || !isReady) return

    const calculateFit = () => {
      const container = containerRef.current
      if (!container) return

      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      // Calculate scale to fit both width and height with generous padding
      const scaleX = containerWidth / canvasWidth
      const scaleY = containerHeight / canvasHeight
      const initialScale = Math.min(scaleX, scaleY) * 0.75 // 75% to ensure everything fits with padding

      setScale(initialScale)
      // Center the canvas with proper padding
      const scaledWidth = canvasWidth * initialScale
      const scaledHeight = canvasHeight * initialScale
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
  }, [isReady])

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
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'mindmap-how-the-state-government-works.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const resetView = () => {
    if (!containerRef.current) return
    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const scaleX = containerWidth / canvasWidth
    const scaleY = containerHeight / canvasHeight
    const initialScale = Math.min(scaleX, scaleY) * 0.75

    const scaledWidth = canvasWidth * initialScale
    const scaledHeight = canvasHeight * initialScale
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
          <canvas ref={canvasRef} className="mindmap-canvas-full" />
        </div>
      </div>
    </div>
  )
}

export default MindMapPage
