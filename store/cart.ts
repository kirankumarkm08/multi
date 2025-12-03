import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type CartItem = {
  id: string
  name: string
  tier?: string
  priceCents: number
  perks?: string[]
  quantity: number
}

type CartState = {
  items: CartItem[]
  couponCode?: string | null
  discountCents?: number
}

type CartActions = {
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void
  increment: (id: string) => void
  decrement: (id: string) => void
  setQuantity: (id: string, qty: number) => void
  removeItem: (id: string) => void
  clear: () => void
  applyCoupon: (code: string, discountCents: number) => void
}

type CartComputed = {
  count: number
  subtotalCents: number
  totalCents: number
}

export const useCartStore = create<CartState & CartActions & CartComputed>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discountCents: 0,

      // actions
      addItem: (item, qty = 1) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.id === item.id)
          if (idx >= 0) {
            const items = [...state.items]
            items[idx] = { ...items[idx], quantity: items[idx].quantity + qty }
            return { items }
          }
          return { items: [...state.items, { ...item, quantity: qty }] }
        }),

      increment: (id) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
        })),

      decrement: (id) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))
            .filter((i) => i.quantity > 0),
        })),

      setQuantity: (id, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, qty) } : i))
            .filter((i) => i.quantity > 0),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      clear: () => set({ items: [], couponCode: null, discountCents: 0 }),

      applyCoupon: (code, discountCents) => set(() => ({ couponCode: code, discountCents })),

      // computed getters (exposed as fields for convenience)
      get count() {
        return get().items.reduce((acc, i) => acc + i.quantity, 0)
      },

      get subtotalCents() {
        return get().items.reduce((acc, i) => acc + i.priceCents * i.quantity, 0)
      },

      get totalCents() {
        const { subtotalCents, discountCents = 0 } = get()
        return Math.max(0, subtotalCents - discountCents)
      },
    }),
    {
      name: "re-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, couponCode: state.couponCode, discountCents: state.discountCents }),
    },
  ),
)

export const formatUSD = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
