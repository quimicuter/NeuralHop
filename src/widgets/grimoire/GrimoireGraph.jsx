import React, { useRef, useEffect, useState, useMemo } from 'react'
import './GrimoireGraph.css'

// Parse [[Note Name]] syntax to find links
const extractLinks = (content) => {
  const linkRegex = /\[\[([^\]]+)\]\]/g
  const links = []
  let match
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1].trim().toLowerCase())
  }
  return links
}

// Build graph data from notes
const buildGraph = (notes) => {
  const nodes = notes.map((note, index) => ({
    id: note.id,
    title: note.title,
    x: Math.random() * 400 + 100,
    y: Math.random() * 300 + 100,
    vx: 0,
    vy: 0,
    radius: Math.min(30 + (note.content?.length || 0) / 100, 50),
    color: note.color || '#8B5CF6',
    tags: note.tags || []
  }))

  const links = []
  const nodeMap = new Map(nodes.map(n => [n.title.toLowerCase(), n.id]))

  notes.forEach(note => {
    const noteLinks = extractLinks(note.content || '')
    noteLinks.forEach(linkTitle => {
      const targetId = nodeMap.get(linkTitle)
      if (targetId && targetId !== note.id) {
        // Check if link already exists
        const exists = links.some(l => 
          (l.source === note.id && l.target === targetId) ||
          (l.source === targetId && l.target === note.id)
        )
        if (!exists) {
          links.push({ source: note.id, target: targetId })
        }
      }
    })
  })

  return { nodes, links }
}

// Force simulation step
const applyForces = (nodes, links, width, height) => {
  const centerForce = 0.02
  const repelForce = 200
  const springLength = 120
  const springStrength = 0.05
  const damping = 0.9

  // Center force
  nodes.forEach(node => {
    const dx = width / 2 - node.x
    const dy = height / 2 - node.y
    node.vx += dx * centerForce
    node.vy += dy * centerForce
  })

  // Repel force between nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x
      const dy = nodes[j].y - nodes[i].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 1) continue
      
      const force = repelForce / (dist * dist)
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      
      nodes[i].vx -= fx
      nodes[i].vy -= fy
      nodes[j].vx += fx
      nodes[j].vy += fy
    }
  }

  // Spring force for links
  links.forEach(link => {
    const source = nodes.find(n => n.id === link.source)
    const target = nodes.find(n => n.id === link.target)
    if (!source || !target) return

    const dx = target.x - source.x
    const dy = target.y - source.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 1) return

    const force = (dist - springLength) * springStrength
    const fx = (dx / dist) * force
    const fy = (dy / dist) * force

    source.vx += fx
    source.vy += fy
    target.vx -= fx
    target.vy -= fy
  })

  // Apply velocity and damping
  nodes.forEach(node => {
    node.vx *= damping
    node.vy *= damping
    node.x += node.vx
    node.y += node.vy

    // Keep within bounds
    node.x = Math.max(node.radius, Math.min(width - node.radius, node.x))
    node.y = Math.max(node.radius, Math.min(height - node.radius, node.y))
  })
}

function GrimoireGraph({ notes, onNoteClick, highlightedNote }) {
  const canvasRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragNode, setDragNode] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [viewMode, setViewMode] = useState('graph') // 'graph' | 'list'
  
  const graphData = useMemo(() => buildGraph(notes), [notes])
  const nodesRef = useRef(graphData.nodes)
  const animationRef = useRef()

  // Update nodes when notes change
  useEffect(() => {
    const newGraph = buildGraph(notes)
    // Preserve positions for existing nodes
    nodesRef.current = newGraph.nodes.map(newNode => {
      const existing = nodesRef.current.find(n => n.id === newNode.id)
      if (existing) {
        return { ...newNode, x: existing.x, y: existing.y, vx: 0, vy: 0 }
      }
      return newNode
    })
  }, [notes])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || viewMode !== 'graph') return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    const animate = () => {
      if (!isDragging) {
        applyForces(nodesRef.current, graphData.links, width, height)
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw background grid
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'
      ctx.lineWidth = 1
      const gridSize = 50
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Apply zoom and offset
      ctx.save()
      ctx.translate(offset.x, offset.y)
      ctx.scale(zoom, zoom)

      // Draw links
      graphData.links.forEach(link => {
        const source = nodesRef.current.find(n => n.id === link.source)
        const target = nodesRef.current.find(n => n.id === link.target)
        if (!source || !target) return

        const isHighlighted = selectedNode === source.id || selectedNode === target.id ||
                             hoveredNode === source.id || hoveredNode === target.id

        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.strokeStyle = isHighlighted ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.2)'
        ctx.lineWidth = isHighlighted ? 3 : 1
        ctx.stroke()
      })

      // Draw nodes
      nodesRef.current.forEach(node => {
        const isSelected = selectedNode === node.id
        const isHovered = hoveredNode === node.id
        const isHighlightedNote = highlightedNote === node.id

        // Glow effect
        if (isSelected || isHovered || isHighlightedNote) {
          const gradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, node.radius * 2
          )
          gradient.addColorStop(0, node.color + '80')
          gradient.addColorStop(1, 'transparent')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2)
          ctx.fill()
        }

        // Node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color + (isSelected ? 'FF' : 'CC')
        ctx.fill()
        
        // Border
        ctx.strokeStyle = isSelected || isHovered ? '#fff' : 'rgba(255,255,255,0.3)'
        ctx.lineWidth = isSelected ? 3 : 2
        ctx.stroke()

        // Title
        ctx.fillStyle = '#fff'
        ctx.font = `${isSelected ? 'bold ' : ''}12px system-ui`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Wrap text
        const maxWidth = node.radius * 1.8
        const words = node.title.split(' ')
        let line = ''
        let y = node.y - (words.length > 2 ? 8 : 0)
        
        words.forEach((word, i) => {
          const testLine = line + word + ' '
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line.trim(), node.x, y)
            line = word + ' '
            y += 14
          } else {
            line = testLine
          }
        })
        ctx.fillText(line.trim(), node.x, y)
      })

      ctx.restore()
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [graphData.links, viewMode, isDragging, selectedNode, hoveredNode, highlightedNote, zoom, offset])

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - offset.x) / zoom
    const y = (e.clientY - rect.top - offset.y) / zoom

    // Check if clicking on a node
    const clickedNode = nodesRef.current.find(node => {
      const dx = x - node.x
      const dy = y - node.y
      return Math.sqrt(dx * dx + dy * dy) < node.radius
    })

    if (clickedNode) {
      setIsDragging(true)
      setDragNode(clickedNode)
      setSelectedNode(clickedNode.id)
      onNoteClick && onNoteClick(clickedNode.id)
    } else {
      // Pan start
      setIsDragging(true)
      setDragNode(null)
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left - offset.x) / zoom
      const y = (e.clientY - rect.top - offset.y) / zoom

      // Check hover
      const hovered = nodesRef.current.find(node => {
        const dx = x - node.x
        const dy = y - node.y
        return Math.sqrt(dx * dx + dy * dy) < node.radius
      })
      setHoveredNode(hovered?.id || null)
      return
    }

    if (dragNode) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      dragNode.x = (e.clientX - rect.left - offset.x) / zoom
      dragNode.y = (e.clientY - rect.top - offset.y) / zoom
      dragNode.vx = 0
      dragNode.vy = 0
    } else {
      // Panning
      setOffset(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragNode(null)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)))
  }

  const resetView = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    // Reset node positions
    nodesRef.current.forEach(node => {
      node.x = Math.random() * 400 + 100
      node.y = Math.random() * 300 + 100
      node.vx = 0
      node.vy = 0
    })
  }

  // List view of connected notes
  const renderListView = () => {
    const connectedNotes = notes.filter(note => {
      const hasLinks = extractLinks(note.content || '').length > 0
      const isLinked = graphData.links.some(l => l.source === note.id || l.target === note.id)
      return hasLinks || isLinked
    })

    return (
      <div className="graph-list-view">
        <h4>Notas Conectadas ({connectedNotes.length})</h4>
        {connectedNotes.map(note => {
          const outgoing = extractLinks(note.content || '')
          const incoming = graphData.links
            .filter(l => l.target === note.id)
            .map(l => notes.find(n => n.id === l.source)?.title)
            .filter(Boolean)

          return (
            <div 
              key={note.id} 
              className={`graph-list-item ${selectedNode === note.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedNode(note.id)
                onNoteClick && onNoteClick(note.id)
              }}
            >
              <div className="list-item-header">
                <span 
                  className="color-dot" 
                  style={{ background: note.color || '#8B5CF6' }}
                />
                <span className="note-title">{note.title}</span>
              </div>
              <div className="list-item-connections">
                {outgoing.length > 0 && (
                  <span className="connection-badge out">
                    → {outgoing.length} salientes
                  </span>
                )}
                {incoming.length > 0 && (
                  <span className="connection-badge in">
                    ← {incoming.length} entrantes
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grimoire-graph-widget">
      <div className="graph-toolbar">
        <div className="graph-view-modes">
          <button 
            className={viewMode === 'graph' ? 'active' : ''}
            onClick={() => setViewMode('graph')}
          >
            🕸️ Grafo
          </button>
          <button 
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            ☰ Lista
          </button>
        </div>
        
        {viewMode === 'graph' && (
          <div className="graph-controls">
            <button onClick={() => setZoom(z => Math.min(3, z * 1.2))}>🔍+</button>
            <button onClick={() => setZoom(z => Math.max(0.3, z * 0.8))}>🔍-</button>
            <button onClick={resetView}>⟲ Reset</button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          </div>
        )}
      </div>

      <div className="graph-content">
        {viewMode === 'graph' ? (
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="graph-canvas"
          />
        ) : (
          renderListView()
        )}
      </div>

      {selectedNode && (
        <div className="graph-info-panel">
          {(() => {
            const note = notes.find(n => n.id === selectedNode)
            if (!note) return null
            
            const outgoing = extractLinks(note.content || '')
            const incoming = graphData.links
              .filter(l => l.target === note.id)
              .map(l => notes.find(n => n.id === l.source))
              .filter(Boolean)

            return (
              <>
                <h4>🔮 {note.title}</h4>
                {outgoing.length > 0 && (
                  <div className="info-section">
                    <span className="info-label">→ Links a:</span>
                    <div className="info-tags">
                      {outgoing.map((title, i) => (
                        <span key={i} className="info-tag">[[{title}]]</span>
                      ))}
                    </div>
                  </div>
                )}
                {incoming.length > 0 && (
                  <div className="info-section">
                    <span className="info-label">← Referenciado por:</span>
                    <div className="info-tags">
                      {incoming.map((n, i) => (
                        <span key={i} className="info-tag ref">{n.title}</span>
                      ))}
                    </div>
                  </div>
                )}
                <button 
                  className="close-info-btn"
                  onClick={() => setSelectedNode(null)}
                >
                  Cerrar
                </button>
              </>
            )
          })()}
        </div>
      )}

      <div className="graph-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#8B5CF6' }} />
          Nota
        </span>
        <span className="legend-item">
          <span className="legend-line" />
          Conexión
        </span>
        <span className="legend-hint">
          Usa [[Título]] para vincular notas
        </span>
      </div>
    </div>
  )
}

export default GrimoireGraph
