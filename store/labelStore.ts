
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Annotation {
  id: string;
  x: number; // Center X
  y: number; // Center Y
  w: number;
  h: number;
  classId: string;
  confidence: number;
}

export interface LabelState {
  // UI State
  zoom: number;
  pan: { x: number, y: number };
  activeTool: 'select' | 'rect';
  selectedId: string | null;
  currentClass: string;
  
  // Data State
  annotations: Annotation[];
  history: Annotation[][]; // Undo stack
  future: Annotation[][]; // Redo stack
  
  // Actions
  setZoom: (z: number) => void;
  setPan: (p: { x: number, y: number }) => void;
  setTool: (t: 'select' | 'rect') => void;
  selectAnnotation: (id: string | null) => void;
  setClass: (id: string) => void;
  
  // Manipulation
  addAnnotation: (ann: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  removeAnnotation: (id: string) => void;
  setAnnotations: (anns: Annotation[]) => void;
  
  // History
  undo: () => void;
  redo: () => void;
}

export const useLabelStore = create<LabelState>()(
  persist(
    (set, get) => ({
      zoom: 1,
      pan: { x: 0, y: 0 },
      activeTool: 'select',
      selectedId: null,
      currentClass: 'car',
      annotations: [],
      history: [],
      future: [],

      setZoom: (z) => set({ zoom: Math.max(0.1, Math.min(z, 10)) }),
      setPan: (p) => set({ pan: p }),
      setTool: (t) => set({ activeTool: t, selectedId: null }),
      selectAnnotation: (id) => set({ selectedId: id, activeTool: 'select' }),
      setClass: (id) => set({ currentClass: id }),

      addAnnotation: (ann) => set((state) => ({
         history: [...state.history, state.annotations],
         future: [],
         annotations: [...state.annotations, ann],
         selectedId: ann.id
      })),

      updateAnnotation: (id, updates) => set((state) => ({
         history: [...state.history, state.annotations],
         future: [],
         annotations: state.annotations.map(a => a.id === id ? { ...a, ...updates } : a)
      })),

      removeAnnotation: (id) => set((state) => ({
         history: [...state.history, state.annotations],
         future: [],
         annotations: state.annotations.filter(a => a.id !== id),
         selectedId: null
      })),

      setAnnotations: (anns) => set((state) => ({
          history: [...state.history, state.annotations],
          future: [],
          annotations: anns
      })),

      undo: () => {
          const { history, annotations, future } = get();
          if (history.length === 0) return;
          const previous = history[history.length - 1];
          const newHistory = history.slice(0, -1);
          set({
              annotations: previous,
              history: newHistory,
              future: [annotations, ...future],
              selectedId: null
          });
      },

      redo: () => {
          const { history, annotations, future } = get();
          if (future.length === 0) return;
          const next = future[0];
          const newFuture = future.slice(1);
          set({
              annotations: next,
              history: [...history, annotations],
              future: newFuture,
              selectedId: null
          });
      }
    }),
    {
      name: 'zipai-label-storage',
      partialize: (state) => ({ annotations: state.annotations }), // Only persist annotations
    }
  )
);
