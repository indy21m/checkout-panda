'use client'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-gray-950 group-[.toaster]:text-gray-50 group-[.toaster]:border-gray-800 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-gray-400',
          actionButton: 'group-[.toast]:bg-gray-50 group-[.toast]:text-gray-900',
          cancelButton: 'group-[.toast]:bg-gray-800 group-[.toast]:text-gray-400',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
