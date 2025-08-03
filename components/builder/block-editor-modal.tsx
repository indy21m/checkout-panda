'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EnhancedProductBlock } from './blocks/enhanced-product-block'
import { useBuilderStore } from '@/stores/builder-store'
import type { EnhancedBlock } from '@/types/builder'

interface BlockEditorModalProps {
  isOpen: boolean
  onClose: () => void
  block: EnhancedBlock
}

export function BlockEditorModal({ isOpen, onClose, block }: BlockEditorModalProps) {
  const [blockData, setBlockData] = useState(block.data)
  const updateEnhancedBlock = useBuilderStore((state) => state.updateEnhancedBlock)

  const handleSave = () => {
    updateEnhancedBlock(block.id, { data: blockData })
    onClose()
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  }

  const renderBlockEditor = () => {
    switch (block.type) {
      case 'product':
        return <EnhancedProductBlock data={blockData} onUpdate={setBlockData} isEditing={true} />
      // Add other block types here as needed
      default:
        return (
          <div className="text-center text-gray-500">
            No editor available for {block.type} block
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
          <DialogHeader>
            <DialogTitle>Edit Block</DialogTitle>
            <DialogDescription>Configure the settings for this block</DialogDescription>
          </DialogHeader>

          <div className="mt-6">{renderBlockEditor()}</div>

          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
