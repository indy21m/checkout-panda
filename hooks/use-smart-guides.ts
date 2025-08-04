import { useState, useCallback, useRef } from 'react'

export interface Guide {
  id: string
  type: 'vertical' | 'horizontal' | 'center-v' | 'center-h'
  position: number
  strength: number
  source: string
}

interface ElementBounds {
  id: string
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
  width: number
  height: number
}

export function useSmartGuides() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [activeElementBounds, setActiveElementBounds] = useState<ElementBounds | null>(null)
  const elementsRef = useRef<Map<string, ElementBounds>>(new Map())

  const SNAP_THRESHOLD = 8 // pixels
  const GUIDE_STRENGTH_FACTOR = 0.125 // 1/8 for smooth strength calculation

  // Register an element's bounds
  const registerElement = useCallback((id: string, bounds: DOMRect) => {
    const elementBounds: ElementBounds = {
      id,
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
      bottom: bounds.bottom,
      centerX: bounds.left + bounds.width / 2,
      centerY: bounds.top + bounds.height / 2,
      width: bounds.width,
      height: bounds.height,
    }
    elementsRef.current.set(id, elementBounds)
  }, [])

  // Unregister an element
  const unregisterElement = useCallback((id: string) => {
    elementsRef.current.delete(id)
  }, [])

  // Calculate guides for a moving element
  const calculateGuides = useCallback(
    (movingBounds: ElementBounds) => {
      const newGuides: Guide[] = []
      const addedPositions = new Set<string>()

      elementsRef.current.forEach((element) => {
        if (element.id === movingBounds.id) return

        // Vertical alignment guides

        // Left edge alignment
        const leftDiff = Math.abs(movingBounds.left - element.left)
        if (leftDiff < SNAP_THRESHOLD) {
          const key = `v-left-${element.left}`
          if (!addedPositions.has(key)) {
            newGuides.push({
              id: key,
              type: 'vertical',
              position: element.left,
              strength: 1 - leftDiff * GUIDE_STRENGTH_FACTOR,
              source: element.id,
            })
            addedPositions.add(key)
          }
        }

        // Right edge alignment
        const rightDiff = Math.abs(movingBounds.right - element.right)
        if (rightDiff < SNAP_THRESHOLD) {
          const key = `v-right-${element.right}`
          if (!addedPositions.has(key)) {
            newGuides.push({
              id: key,
              type: 'vertical',
              position: element.right,
              strength: 1 - rightDiff * GUIDE_STRENGTH_FACTOR,
              source: element.id,
            })
            addedPositions.add(key)
          }
        }

        // Left to right alignment
        const leftToRightDiff = Math.abs(movingBounds.left - element.right)
        if (leftToRightDiff < SNAP_THRESHOLD) {
          const key = `v-lr-${element.right}`
          if (!addedPositions.has(key)) {
            newGuides.push({
              id: key,
              type: 'vertical',
              position: element.right,
              strength: 1 - leftToRightDiff * GUIDE_STRENGTH_FACTOR,
              source: element.id,
            })
            addedPositions.add(key)
          }
        }

        // Right to left alignment
        const rightToLeftDiff = Math.abs(movingBounds.right - element.left)
        if (rightToLeftDiff < SNAP_THRESHOLD) {
          const key = `v-rl-${element.left}`
          if (!addedPositions.has(key)) {
            newGuides.push({
              id: key,
              type: 'vertical',
              position: element.left,
              strength: 1 - rightToLeftDiff * GUIDE_STRENGTH_FACTOR,
              source: element.id,
            })
            addedPositions.add(key)
          }
        }

        // Center vertical alignment
        const centerXDiff = Math.abs(movingBounds.centerX - element.centerX)
        if (centerXDiff < SNAP_THRESHOLD) {
          const key = `v-center-${element.centerX}`
          if (!addedPositions.has(key)) {
            newGuides.push({
              id: key,
              type: 'center-v',
              position: element.centerX,
              strength: 1 - centerXDiff * GUIDE_STRENGTH_FACTOR,
              source: element.id,
            })
            addedPositions.add(key)
          }
        }

        // Horizontal alignment guides

        // Top edge alignment
        const topDiff = Math.abs(movingBounds.top - element.top)
        if (topDiff < SNAP_THRESHOLD) {
          const key = `h-top-${element.top}`
          if (!addedPositions.has(key)) {
            newGuides.push({
              id: key,
              type: 'horizontal',
              position: element.top,
              strength: 1 - topDiff * GUIDE_STRENGTH_FACTOR,
              source: element.id,
            })
            addedPositions.add(key)
          }
        }

        // Bottom edge alignment
        const bottomDiff = Math.abs(movingBounds.bottom - element.bottom)
        if (bottomDiff < SNAP_THRESHOLD) {
          const key = `h-bottom-${element.bottom}`
          if (!addedPositions.has(key)) {
            newGuides.push({
              id: key,
              type: 'horizontal',
              position: element.bottom,
              strength: 1 - bottomDiff * GUIDE_STRENGTH_FACTOR,
              source: element.id,
            })
            addedPositions.add(key)
          }
        }

        // Top to bottom alignment
        const topToBottomDiff = Math.abs(movingBounds.top - element.bottom)
        if (topToBottomDiff < SNAP_THRESHOLD) {
          const key = `h-tb-${element.bottom}`
          if (!addedPositions.has(key)) {
            newGuides.push({
              id: key,
              type: 'horizontal',
              position: element.bottom,
              strength: 1 - topToBottomDiff * GUIDE_STRENGTH_FACTOR,
              source: element.id,
            })
            addedPositions.add(key)
          }
        }

        // Bottom to top alignment
        const bottomToTopDiff = Math.abs(movingBounds.bottom - element.top)
        if (bottomToTopDiff < SNAP_THRESHOLD) {
          const key = `h-bt-${element.top}`
          if (!addedPositions.has(key)) {
            newGuides.push({
              id: key,
              type: 'horizontal',
              position: element.top,
              strength: 1 - bottomToTopDiff * GUIDE_STRENGTH_FACTOR,
              source: element.id,
            })
            addedPositions.add(key)
          }
        }

        // Center horizontal alignment
        const centerYDiff = Math.abs(movingBounds.centerY - element.centerY)
        if (centerYDiff < SNAP_THRESHOLD) {
          const key = `h-center-${element.centerY}`
          if (!addedPositions.has(key)) {
            newGuides.push({
              id: key,
              type: 'center-h',
              position: element.centerY,
              strength: 1 - centerYDiff * GUIDE_STRENGTH_FACTOR,
              source: element.id,
            })
            addedPositions.add(key)
          }
        }
      })

      // Sort guides by strength (strongest first)
      return newGuides.sort((a, b) => b.strength - a.strength)
    },
    [SNAP_THRESHOLD, GUIDE_STRENGTH_FACTOR]
  )

  // Start dragging
  const onDragStart = useCallback((elementId: string, bounds: DOMRect) => {
    const elementBounds: ElementBounds = {
      id: elementId,
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
      bottom: bounds.bottom,
      centerX: bounds.left + bounds.width / 2,
      centerY: bounds.top + bounds.height / 2,
      width: bounds.width,
      height: bounds.height,
    }
    setActiveElementBounds(elementBounds)
    setGuides([])
  }, [])

  // Update during drag
  const onDragMove = useCallback(
    (bounds: DOMRect) => {
      if (!activeElementBounds) return

      const movingBounds: ElementBounds = {
        ...activeElementBounds,
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
        centerX: bounds.left + bounds.width / 2,
        centerY: bounds.top + bounds.height / 2,
      }

      const newGuides = calculateGuides(movingBounds)
      setGuides(newGuides)

      // Return snap points if any strong guides exist
      const strongGuides = newGuides.filter((g) => g.strength > 0.8)
      if (strongGuides.length > 0) {
        let snapX: number | null = null
        let snapY: number | null = null

        const verticalGuide = strongGuides.find(
          (g) => g.type === 'vertical' || g.type === 'center-v'
        )
        const horizontalGuide = strongGuides.find(
          (g) => g.type === 'horizontal' || g.type === 'center-h'
        )

        if (verticalGuide) {
          if (verticalGuide.type === 'center-v') {
            snapX = verticalGuide.position - movingBounds.width / 2
          } else {
            snapX = verticalGuide.position
          }
        }

        if (horizontalGuide) {
          if (horizontalGuide.type === 'center-h') {
            snapY = horizontalGuide.position - movingBounds.height / 2
          } else {
            snapY = horizontalGuide.position
          }
        }

        return { snapX, snapY }
      }

      return null
    },
    [activeElementBounds, calculateGuides]
  )

  // End dragging
  const onDragEnd = useCallback(() => {
    setGuides([])
    setActiveElementBounds(null)
  }, [])

  return {
    guides,
    registerElement,
    unregisterElement,
    onDragStart,
    onDragMove,
    onDragEnd,
  }
}
