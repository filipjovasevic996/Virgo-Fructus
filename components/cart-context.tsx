'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  weight: string
  price: number
  quantity: number
  image: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string, weight: string) => void
  updateQuantity: (id: string, weight: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vigor-fructus-cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch {
        // Invalid JSON, ignore
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('vigor-fructus-cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.weight === item.weight)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.weight === item.weight
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (id: string, weight: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.weight === weight)))
  }

  const updateQuantity = (id: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, weight)
      return
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.weight === weight ? { ...i, quantity } : i
      )
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
