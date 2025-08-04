// Enhanced builder types for professional-grade page builder

// Animation types
export interface AnimationConfig {
  id: string
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'custom'
  trigger: 'onLoad' | 'onScroll' | 'onHover' | 'onClick'
  duration: number // in ms
  delay?: number // in ms
  easing?: string // CSS easing function
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number // for slide animations
  scale?: number // for scale animations
  rotate?: number // degrees for rotation
  opacity?: { from: number; to: number }
  stagger?: number // for staggered animations
  scrollThreshold?: number // 0-1 for scroll trigger
  custom?: {
    keyframes: Record<string, any>[]
    options?: KeyframeAnimationOptions
  }
}

// Interaction types
export interface InteractionConfig {
  id: string
  type: 'hover' | 'click' | 'focus' | 'custom'
  actions: InteractionAction[]
}

export interface InteractionAction {
  type: 'animate' | 'navigate' | 'toggle' | 'custom'
  target?: 'self' | 'parent' | string // element selector
  animation?: AnimationConfig
  url?: string // for navigation
  toggleClass?: string
  customAction?: string // JS code
}

// Layout types
export interface ResponsiveValue<T> {
  base?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}

export interface GridConfig {
  columns: ResponsiveValue<number> // 12-column system
  gap: ResponsiveValue<string> // e.g., '1rem', '16px'
  alignItems?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>
  justifyItems?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>
  customTemplate?: {
    columns: string
    rows: string
  }
}

// Section type - top-level container
export interface Section {
  id: string
  type: 'section'
  name?: string
  columns: Column[]
  settings: {
    fullWidth?: boolean
    maxWidth?: ResponsiveValue<string>
    padding?: ResponsiveValue<string>
    margin?: ResponsiveValue<string>
    background?: {
      type: 'color' | 'gradient' | 'image' | 'video'
      value: string
      overlay?: string // rgba color
      parallax?: boolean
      blur?: number
    }
    grid: GridConfig
    animation?: AnimationConfig
    className?: string
    customCss?: string
  }
  visibility?: {
    desktop?: boolean
    tablet?: boolean
    mobile?: boolean
  }
}

// Column type - grid column container
export interface Column {
  id: string
  type: 'column'
  span: ResponsiveValue<number> // 1-12
  offset?: ResponsiveValue<number> // 0-11
  blocks: EnhancedBlock[]
  settings: {
    padding?: ResponsiveValue<string>
    background?: string
    border?: string
    borderRadius?: string
    minHeight?: ResponsiveValue<string>
    verticalAlign?: 'top' | 'middle' | 'bottom'
    animation?: AnimationConfig
    className?: string
  }
}

// Enhanced block type with animations and interactions
export interface EnhancedBlock {
  id: string
  type: string
  data: any
  styles: {
    padding?: string
    margin?: string
    className?: string
    minHeight?: string
    [key: string]: any
  }
  animations?: AnimationConfig[]
  interactions?: InteractionConfig[]
  visibility?: {
    condition?: string // JS expression
    desktop?: boolean
    tablet?: boolean
    mobile?: boolean
  }
  position: number // for ordering within column
}

// Canvas settings
export interface EnhancedCanvasSettings {
  theme: 'light' | 'dark' | 'auto'
  customCss?: string
  globalAnimations?: {
    pageTransition?: AnimationConfig
    blockTransition?: AnimationConfig
    scrollSmoothing?: boolean
  }
  grid?: {
    show: boolean
    size: number // pixels
    color: string
    snap: boolean
  }
  seoMeta?: {
    title?: string
    description?: string
    ogImage?: string
  }
}

// Builder state types
export interface BuilderHistory {
  past: BuilderState[]
  present: BuilderState
  future: BuilderState[]
}

export interface BuilderState {
  sections: Section[]
  selectedIds: string[] // Support multi-select
  selectedType: 'section' | 'column' | 'block' | null
  canvasSettings: EnhancedCanvasSettings
}

// Command types for command palette
export interface Command {
  id: string
  name: string
  description?: string
  icon?: React.ReactNode
  shortcut?: string[]
  action: () => void
  category?: 'block' | 'edit' | 'view' | 'help'
}

// Clipboard types
export interface ClipboardData {
  type: 'section' | 'column' | 'block' | 'multiple'
  data: Section | Column | EnhancedBlock | Array<Section | Column | EnhancedBlock>
}

// Export all types
export type BuilderElement = Section | Column | EnhancedBlock

// Type guards
export const isSection = (element: BuilderElement): element is Section => {
  return element.type === 'section'
}

export const isColumn = (element: BuilderElement): element is Column => {
  return element.type === 'column'
}

export const isBlock = (element: BuilderElement): element is EnhancedBlock => {
  return element.type !== 'section' && element.type !== 'column'
}
