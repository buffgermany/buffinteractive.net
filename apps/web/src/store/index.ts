import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// UI Store — global UI state (sidebar, modals, etc.)
// ============================================================

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

// ============================================================
// Cart Store — persisted client-side cart state
// (Pre-checkout state only — actual orders live in DB)
// ============================================================

interface CartItem {
  productId: string;
  productName: string;
  slug: string;
  priceCents: number;
  currency: string;
  paymentType: "digital_goods" | "human";
}

interface CartState {
  item: CartItem | null;
  setItem: (item: CartItem) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      item: null,
      setItem: (item) => set({ item }),
      clear: () => set({ item: null }),
    }),
    { name: "platform-cart" }
  )
);
