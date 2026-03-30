import { create } from "zustand";
import type { Range } from "../types/type";

interface DashboardState {
  range: Range;
  setRange: (range: Range) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  range: "30d",
  setRange: (range) => set({ range }),
}));
