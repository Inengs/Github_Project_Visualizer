import { create } from "zustand";
import type { DataRange } from "../types/type";

interface DashboardState {
  range: DataRange;
  setRange: (range: DataRange) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  range: "30d",
  setRange: (range) => set({ range }),
}));
