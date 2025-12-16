import { create } from "zustand";

type Product = {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  firmness: string;
  size: string;
  heightInches: string;
};

type ProductStore = {
  products: Product[];
  setProducts: (products: Product[]) => void;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
}));


