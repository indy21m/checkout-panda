"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  gradient?: "primary" | "secondary" | "accent" | "custom"
  from?: string
  to?: string
  via?: string
}

export function GradientText({
  children,
  className,
  gradient = "primary",
  from,
  to,
  via,
  ...props
}: GradientTextProps) {
  const gradientClasses = {
    primary: "from-blue-400 to-blue-600",
    secondary: "from-purple-400 to-purple-600",
    accent: "from-pink-400 to-pink-600",
    custom: "",
  }

  const customGradient = gradient === "custom" && from && to
    ? `${from} ${via ? `via-${via}` : ""} ${to}`
    : gradientClasses[gradient]

  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        customGradient,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}