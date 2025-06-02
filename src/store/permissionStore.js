import { create } from 'zustand';

export const usePermissionStore = create((set) => ({
  features: [],
  maxFeatures: [],

  setPermissions: ({ features, maxFeatures }) =>
    set(() => ({ features, maxFeatures })),

  clearPermissions: () => set({ features: [], maxFeatures: [] }),

  hasAccess: (key) =>
    get().features.includes(key) && !get().maxFeatures.includes(key),
}));
