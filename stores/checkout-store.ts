import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OrderBump {
  id: string
  productId: string
  name: string
  price: number
  originalPrice?: number
  discountPercent?: number
}

interface CheckoutState {
  // Main product
  mainProductId: string | null
  mainProductPrice: number

  // Order bumps
  selectedBumps: string[] // Array of bump IDs
  availableBumps: OrderBump[]

  // Customer info
  customerEmail: string
  customerName: string

  // Cart totals
  subtotal: number
  total: number

  // Actions
  setMainProduct: (productId: string, price: number) => void
  toggleBump: (bumpId: string) => void
  setAvailableBumps: (bumps: OrderBump[]) => void
  setCustomerInfo: (email: string, name: string) => void
  calculateTotals: () => void
  resetCheckout: () => void
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      // Initial state
      mainProductId: null,
      mainProductPrice: 0,
      selectedBumps: [],
      availableBumps: [],
      customerEmail: '',
      customerName: '',
      subtotal: 0,
      total: 0,

      // Set main product
      setMainProduct: (productId, price) =>
        set((state) => {
          state.mainProductId = productId
          state.mainProductPrice = price
          get().calculateTotals()
          return state
        }),

      // Toggle order bump selection
      toggleBump: (bumpId) =>
        set((state) => {
          const isSelected = state.selectedBumps.includes(bumpId)
          if (isSelected) {
            state.selectedBumps = state.selectedBumps.filter((id) => id !== bumpId)
          } else {
            state.selectedBumps = [...state.selectedBumps, bumpId]
          }
          get().calculateTotals()
          return state
        }),

      // Set available bumps
      setAvailableBumps: (bumps) =>
        set((state) => {
          state.availableBumps = bumps
          return state
        }),

      // Set customer info
      setCustomerInfo: (email, name) =>
        set((state) => {
          state.customerEmail = email
          state.customerName = name
          return state
        }),

      // Calculate cart totals
      calculateTotals: () =>
        set((state) => {
          let subtotal = state.mainProductPrice

          // Add selected bumps
          state.selectedBumps.forEach((bumpId) => {
            const bump = state.availableBumps.find((b) => b.id === bumpId)
            if (bump) {
              subtotal += bump.price
            }
          })

          state.subtotal = subtotal
          state.total = subtotal // Add tax/fees calculation here if needed
          return state
        }),

      // Reset checkout state
      resetCheckout: () =>
        set({
          mainProductId: null,
          mainProductPrice: 0,
          selectedBumps: [],
          availableBumps: [],
          customerEmail: '',
          customerName: '',
          subtotal: 0,
          total: 0,
        }),
    }),
    {
      name: 'checkout-storage',
      partialize: (state) => ({
        selectedBumps: state.selectedBumps,
        customerEmail: state.customerEmail,
        customerName: state.customerName,
      }),
    }
  )
)
