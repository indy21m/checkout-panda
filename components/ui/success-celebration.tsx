'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Sparkles } from 'lucide-react'
import { createPortal } from 'react-dom'

interface SuccessCelebrationProps {
  show: boolean
  message?: string
  onComplete?: () => void
}

export function SuccessCelebration({
  show,
  message = 'Success!',
  onComplete,
}: SuccessCelebrationProps) {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [show, onComplete])

  if (!show) return null

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 400 - 200,
    y: Math.random() * 400 - 200,
    delay: Math.random() * 0.4,
    duration: 0.6 + Math.random() * 0.4,
    size: Math.random() * 6 + 4,
  }))

  const celebration = (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background blur effect */}
          <motion.div
            className="pointer-events-auto absolute inset-0 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onComplete}
          />

          {/* Central explosion effect */}
          <motion.div
            className="absolute h-64 w-64 rounded-full bg-purple-500/30 blur-3xl"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 3, 2.5] }}
            transition={{ duration: 0.6 }}
          />

          {/* Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: 'easeOut',
              }}
            >
              <Sparkles
                className="text-purple-400"
                style={{
                  width: particle.size,
                  height: particle.size,
                  filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.5))',
                }}
              />
            </motion.div>
          ))}

          {/* Success icon and message */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
          >
            <motion.div
              className="relative"
              animate={{
                filter: [
                  'drop-shadow(0 0 0px rgba(34, 197, 94, 0))',
                  'drop-shadow(0 0 20px rgba(34, 197, 94, 0.8))',
                  'drop-shadow(0 0 10px rgba(34, 197, 94, 0.4))',
                ],
              }}
              transition={{ duration: 1, repeat: 2 }}
            >
              <CheckCircle className="h-20 w-20 text-green-500" />
              <motion.div
                className="absolute inset-0 rounded-full bg-green-500/20"
                animate={{ scale: [1, 1.5, 1.3] }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>

            <motion.h2
              className="text-2xl font-bold text-white drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {message}
            </motion.h2>
          </motion.div>

          {/* Circular waves */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute h-32 w-32 rounded-full border-2 border-purple-400/30"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 4, 5], opacity: [1, 0.5, 0] }}
              transition={{ duration: 1, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(celebration, document.body) : null
}
