'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Guide } from '@/hooks/use-smart-guides'

interface SmartGuidesProps {
  guides: Guide[]
  containerRef?: React.RefObject<HTMLElement>
}

export function SmartGuides({ guides, containerRef }: SmartGuidesProps) {
  // Get container bounds for relative positioning
  const getRelativePosition = (position: number, isVertical: boolean) => {
    if (!containerRef?.current) return position

    const rect = containerRef.current.getBoundingClientRect()
    return isVertical ? position - rect.left : position - rect.top
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-50 overflow-visible"
      style={{ width: '100%', height: '100%' }}
    >
      <AnimatePresence>
        {guides.map((guide) => {
          const isVertical = guide.type === 'vertical' || guide.type === 'center-v'
          const position = containerRef
            ? getRelativePosition(guide.position, isVertical)
            : guide.position

          if (isVertical) {
            return (
              <motion.g
                key={guide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: guide.strength }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                {/* Main guide line */}
                <motion.line
                  x1={position}
                  y1="0"
                  x2={position}
                  y2="100%"
                  stroke="#8b5cf6"
                  strokeWidth={guide.type === 'center-v' ? 2 : 1}
                  strokeDasharray={guide.type === 'center-v' ? '8,4' : '4,4'}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.2 }}
                />

                {/* Glow effect for strong guides */}
                {guide.strength > 0.8 && (
                  <motion.line
                    x1={position}
                    y1="0"
                    x2={position}
                    y2="100%"
                    stroke="#8b5cf6"
                    strokeWidth={4}
                    opacity={0.3}
                    filter="blur(2px)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 * guide.strength }}
                  />
                )}

                {/* Center indicator */}
                {guide.type === 'center-v' && (
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <circle cx={position} cy="50%" r="4" fill="#8b5cf6" opacity={guide.strength} />
                    <circle
                      cx={position}
                      cy="50%"
                      r="8"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="1"
                      opacity={guide.strength * 0.5}
                    />
                  </motion.g>
                )}
              </motion.g>
            )
          } else {
            return (
              <motion.g
                key={guide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: guide.strength }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                {/* Main guide line */}
                <motion.line
                  x1="0"
                  y1={position}
                  x2="100%"
                  y2={position}
                  stroke="#8b5cf6"
                  strokeWidth={guide.type === 'center-h' ? 2 : 1}
                  strokeDasharray={guide.type === 'center-h' ? '8,4' : '4,4'}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.2 }}
                />

                {/* Glow effect for strong guides */}
                {guide.strength > 0.8 && (
                  <motion.line
                    x1="0"
                    y1={position}
                    x2="100%"
                    y2={position}
                    stroke="#8b5cf6"
                    strokeWidth={4}
                    opacity={0.3}
                    filter="blur(2px)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 * guide.strength }}
                  />
                )}

                {/* Center indicator */}
                {guide.type === 'center-h' && (
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <circle cx="50%" cy={position} r="4" fill="#8b5cf6" opacity={guide.strength} />
                    <circle
                      cx="50%"
                      cy={position}
                      r="8"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="1"
                      opacity={guide.strength * 0.5}
                    />
                  </motion.g>
                )}
              </motion.g>
            )
          }
        })}
      </AnimatePresence>

      {/* Distance indicators for strongest guides */}
      <AnimatePresence>
        {guides
          .filter((g) => g.strength > 0.9)
          .slice(0, 2)
          .map((guide) => {
            const isVertical = guide.type === 'vertical' || guide.type === 'center-v'
            const position = containerRef
              ? getRelativePosition(guide.position, isVertical)
              : guide.position

            return (
              <motion.g
                key={`${guide.id}-distance`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <rect
                  x={isVertical ? position - 30 : 10}
                  y={isVertical ? 10 : position - 10}
                  width={isVertical ? 60 : 80}
                  height="20"
                  rx="4"
                  fill="#8b5cf6"
                  opacity={0.9}
                />
                <text
                  x={isVertical ? position : 50}
                  y={isVertical ? 24 : position + 4}
                  textAnchor="middle"
                  className="text-xs font-medium"
                  fill="white"
                >
                  {guide.type.includes('center') ? 'Center' : 'Aligned'}
                </text>
              </motion.g>
            )
          })}
      </AnimatePresence>
    </svg>
  )
}
