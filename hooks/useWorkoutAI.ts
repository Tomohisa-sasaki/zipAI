
import { useState, useMemo } from 'react';

export type ExerciseType = 'SQUAT' | 'BENCH_PRESS' | 'DEADLIFT';
export type ViewMode = 'CLEAN' | 'DETAIL' | 'XRAY';

export interface MuscleDefinition {
  id: string;
  name: string;
  role: 'AGONIST' | 'SYNERGIST' | 'STABILIZER';
  // Activation curve: [Start, Mid, End]
  curve: [number, number, number]; 
  // Procedural Generation Config
  origin: string; // Bone ID
  insertion: string; // Bone ID
  fibers: number; // Number of strands to generate
  radius: number; // Base thickness
  color: string; 
}

export interface BiomechanicalProfile {
  name: string;
  muscles: Record<string, MuscleDefinition>;
  description: string;
  cameraPosition: [number, number, number];
}

// --- Biomechanical Data Definitions ---

const EXERCISE_DATA: Record<ExerciseType, BiomechanicalProfile> = {
  SQUAT: {
    name: "Barbell Back Squat",
    description: "Compound lower body movement. Load peaks at maximum knee flexion (bottom).",
    cameraPosition: [3, 2, 4],
    muscles: {
      'quads_rectus': { id: 'quads_rectus', name: 'Rectus Femoris', role: 'AGONIST', curve: [0.3, 1.0, 0.4], origin: 'Hip', insertion: 'Knee', fibers: 8, radius: 0.08, color: '#3b82f6' },
      'quads_vastus': { id: 'quads_vastus', name: 'Vastus Lateralis', role: 'AGONIST', curve: [0.3, 1.0, 0.4], origin: 'FemurTop', insertion: 'Knee', fibers: 12, radius: 0.1, color: '#60a5fa' },
      'glutes': { id: 'glutes', name: 'Gluteus Max', role: 'AGONIST', curve: [0.2, 0.9, 0.8], origin: 'Hip', insertion: 'FemurMid', fibers: 15, radius: 0.15, color: '#8b5cf6' },
      'hams': { id: 'hams', name: 'Hamstrings', role: 'SYNERGIST', curve: [0.1, 0.3, 0.1], origin: 'Hip', insertion: 'KneeBack', fibers: 10, radius: 0.09, color: '#f59e0b' },
      'core': { id: 'core', name: 'Abdominals', role: 'STABILIZER', curve: [0.5, 0.8, 0.5], origin: 'Ribcage', insertion: 'Hip', fibers: 6, radius: 0.2, color: '#10b981' },
      'erector': { id: 'erector', name: 'Erector Spinae', role: 'STABILIZER', curve: [0.6, 0.9, 0.6], origin: 'Neck', insertion: 'Hip', fibers: 8, radius: 0.06, color: '#ef4444' },
      'calves': { id: 'calves', name: 'Gastrocnemius', role: 'SYNERGIST', curve: [0.2, 0.5, 0.2], origin: 'KneeBack', insertion: 'Ankle', fibers: 8, radius: 0.08, color: '#f97316' }
    }
  },
  BENCH_PRESS: {
    name: "Bench Press",
    description: "Upper body push. Load peaks at the chest (stretch) and lockout (triceps).",
    cameraPosition: [0, 4, 2],
    muscles: {
      'pec_major': { id: 'pec_major', name: 'Pec Major', role: 'AGONIST', curve: [0.3, 1.0, 0.5], origin: 'Sternum', insertion: 'Humerus', fibers: 16, radius: 0.15, color: '#3b82f6' },
      'triceps': { id: 'triceps', name: 'Triceps', role: 'AGONIST', curve: [0.2, 0.6, 1.0], origin: 'Shoulder', insertion: 'Elbow', fibers: 10, radius: 0.08, color: '#8b5cf6' },
      'delts_front': { id: 'delts_front', name: 'Ant. Deltoid', role: 'SYNERGIST', curve: [0.4, 0.9, 0.4], origin: 'Clavicle', insertion: 'Humerus', fibers: 8, radius: 0.07, color: '#f59e0b' },
      'lats': { id: 'lats', name: 'Latissimus Dorsi', role: 'STABILIZER', curve: [0.3, 0.3, 0.3], origin: 'SpineMid', insertion: 'Humerus', fibers: 12, radius: 0.12, color: '#10b981' },
      'biceps': { id: 'biceps', name: 'Biceps (Stabilizer)', role: 'STABILIZER', curve: [0.1, 0.1, 0.1], origin: 'Shoulder', insertion: 'Forearm', fibers: 6, radius: 0.06, color: '#64748b' }
    }
  },
  DEADLIFT: {
    name: "Conventional Deadlift",
    description: "Posterior chain hinge. Peak torque at floor separation.",
    cameraPosition: [4, 2, 0],
    muscles: {
      'hams': { id: 'hams', name: 'Hamstrings', role: 'AGONIST', curve: [0.9, 0.6, 0.2], origin: 'Hip', insertion: 'KneeBack', fibers: 12, radius: 0.1, color: '#3b82f6' },
      'glutes': { id: 'glutes', name: 'Gluteus Max', role: 'AGONIST', curve: [0.7, 0.8, 1.0], origin: 'Hip', insertion: 'FemurMid', fibers: 16, radius: 0.15, color: '#8b5cf6' },
      'erector': { id: 'erector', name: 'Erector Spinae', role: 'AGONIST', curve: [0.9, 1.0, 0.6], origin: 'Neck', insertion: 'Hip', fibers: 10, radius: 0.08, color: '#ef4444' },
      'lats': { id: 'lats', name: 'Lats', role: 'STABILIZER', curve: [0.8, 0.8, 0.5], origin: 'SpineMid', insertion: 'Humerus', fibers: 10, radius: 0.12, color: '#10b981' },
      'traps': { id: 'traps', name: 'Trapezius', role: 'STABILIZER', curve: [0.7, 0.9, 0.9], origin: 'Neck', insertion: 'Shoulder', fibers: 8, radius: 0.08, color: '#f59e0b' },
      'quads': { id: 'quads', name: 'Quadriceps', role: 'SYNERGIST', curve: [0.8, 0.4, 0.1], origin: 'FemurTop', insertion: 'Knee', fibers: 10, radius: 0.1, color: '#f97316' }
    }
  }
};

export const useWorkoutAI = () => {
  const [exercise, setExercise] = useState<ExerciseType>('SQUAT');
  const [load, setLoad] = useState<number>(0.85); // Default high intensity
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [viewMode, setViewMode] = useState<ViewMode>('DETAIL');

  const currentProfile = useMemo(() => EXERCISE_DATA[exercise], [exercise]);

  return {
    exercise,
    setExercise,
    load,
    setLoad,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    viewMode,
    setViewMode,
    currentProfile
  };
};
