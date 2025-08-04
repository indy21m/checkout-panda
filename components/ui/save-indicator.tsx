'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, Cloud, CloudOff } from 'lucide-react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline'

interface SaveIndicatorProps {
  status: SaveStatus
  lastSaved?: Date | null
}

export function SaveIndicator({ status, lastSaved }: SaveIndicatorProps) {
  const getContent = () => {
    switch (status) {
      case 'saving':
        return {
          icon: (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-4 w-4 text-blue-500" />
            </motion.div>
          ),
          text: 'Saving...',
          className: 'text-blue-600',
        }

      case 'saved':
        return {
          icon: (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </motion.div>
          ),
          text: lastSaved ? `Saved ${formatTimeAgo(lastSaved)}` : 'All changes saved',
          className: 'text-green-600',
        }

      case 'error':
        return {
          icon: (
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: 3 }}>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </motion.div>
          ),
          text: 'Failed to save',
          className: 'text-red-600',
        }

      case 'offline':
        return {
          icon: <CloudOff className="h-4 w-4 text-gray-500" />,
          text: 'Offline',
          className: 'text-gray-600',
        }

      default:
        return {
          icon: <Cloud className="h-4 w-4 text-gray-400" />,
          text: '',
          className: 'text-gray-500',
        }
    }
  }

  const content = getContent()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-2 text-sm ${content.className}`}
      >
        {content.icon}
        {content.text && <span>{content.text}</span>}
      </motion.div>
    </AnimatePresence>
  )
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) {
    return 'just now'
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(seconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}
