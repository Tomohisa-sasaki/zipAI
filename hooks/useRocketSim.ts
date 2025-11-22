import { useState, useEffect, useRef, useCallback } from 'react';

export interface TelemetryData {
  time: number;
  altitude: number;
  velocity: number;
  acceleration: number;
  thrust: number;
  fuel: number;
  mass: number;
  stage: number;
  status: 'PRE_LAUNCH' | 'IGNITION' | 'ASCENT' | 'MECO' | 'APOGEE' | 'DESCENT' | 'LANDED';
}

// Simulation Constants (The "Backend" Config)
const SIM_CONFIG = {
  tickRate: 50, // ms (20Hz)
  gravity: 9.81,
  dryMass: 2500, // kg
  fuelMass: 18000, // kg
  maxThrust: 380000, // N (~38 tons)
  burnTime: 55, // seconds
  dragCoefficient: 0.25, // Simplified air resistance
  airDensitySeaLevel: 1.225,
};

const INITIAL_STATE: TelemetryData = {
  time: 0,
  altitude: 0,
  velocity: 0,
  acceleration: 0,
  thrust: 0,
  fuel: SIM_CONFIG.fuelMass,
  mass: SIM_CONFIG.dryMass + SIM_CONFIG.fuelMass,
  stage: 1,
  status: 'PRE_LAUNCH',
};

export const useRocketSim = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData>(INITIAL_STATE);
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef<TelemetryData>({ ...INITIAL_STATE });

  // Physics Engine Step Function (The "Server Logic")
  const stepPhysics = useCallback(() => {
    const current = stateRef.current;
    const dt = SIM_CONFIG.tickRate / 1000; // Delta time in seconds

    if (current.status === 'LANDED') return;

    // 1. Update Timing
    let newTime = current.time;
    if (current.status !== 'PRE_LAUNCH') {
        newTime += dt;
    }

    // 2. Determine Thrust & Fuel
    let thrust = 0;
    let fuel = current.fuel;
    // Explicitly type status to prevent TypeScript from narrowing it based on the early return above
    let status: TelemetryData['status'] = current.status;

    if (status === 'IGNITION' || status === 'ASCENT') {
        if (fuel > 0) {
            thrust = SIM_CONFIG.maxThrust;
            const burnRate = SIM_CONFIG.fuelMass / SIM_CONFIG.burnTime; // kg/s
            fuel = Math.max(0, fuel - (burnRate * dt));
            status = 'ASCENT';
        } else {
            thrust = 0;
            status = 'MECO'; // Main Engine Cut Off
        }
    } else if (status === 'MECO') {
        if (current.velocity < 0) status = 'APOGEE';
    } else if (status === 'APOGEE') {
        if (current.altitude <= 0) status = 'LANDED';
        else status = 'DESCENT';
    } else if (status === 'DESCENT') {
        if (current.altitude <= 0) status = 'LANDED';
    }

    // 3. Calculate Mass
    const totalMass = SIM_CONFIG.dryMass + fuel;

    // 4. Calculate Forces
    // F_gravity
    const fGravity = totalMass * SIM_CONFIG.gravity;

    // F_drag (Simplified: 0.5 * p * v^2 * Cd * A)
    // Approximation: air density drops with altitude
    const airDensity = SIM_CONFIG.airDensitySeaLevel * Math.exp(-current.altitude / 8500); 
    const dragDirection = current.velocity > 0 ? -1 : 1;
    const fDrag = 0.5 * airDensity * (current.velocity ** 2) * SIM_CONFIG.dragCoefficient * dragDirection;

    // F_net
    const fNet = thrust - fGravity + fDrag;

    // 5. Integration (Euler)
    let acc = fNet / totalMass;
    
    // Ground constraint
    if (current.altitude <= 0 && thrust < fGravity && current.velocity <= 0) {
        acc = 0;
        if (status !== 'PRE_LAUNCH') {
           // Impact
           status = 'LANDED';
        }
    }

    const vel = current.velocity + (acc * dt);
    const alt = Math.max(0, current.altitude + (vel * dt));

    // Update State Ref
    stateRef.current = {
        time: newTime,
        altitude: alt,
        velocity: vel,
        acceleration: acc,
        thrust,
        fuel,
        mass: totalMass,
        stage: 1,
        status
    };

    // Broadcast State (Simulating WebSocket push)
    setTelemetry({ ...stateRef.current });

  }, []);

  const launch = () => {
     if (simulationRef.current) clearInterval(simulationRef.current);
     stateRef.current = { ...INITIAL_STATE, status: 'IGNITION' };
     setTelemetry(stateRef.current);
     
     simulationRef.current = setInterval(stepPhysics, SIM_CONFIG.tickRate);
  };

  const reset = () => {
    if (simulationRef.current) clearInterval(simulationRef.current);
    stateRef.current = { ...INITIAL_STATE };
    setTelemetry(INITIAL_STATE);
  };

  useEffect(() => {
    return () => {
        if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, []);

  return { telemetry, launch, reset };
};