import { create } from 'zustand';
import type { LiveData, CircuitData, FaultData, DeviceInfo, Settings } from '@/types/firebase';

interface AppState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  deviceId: string;
  liveData: LiveData | null;
  circuits: Record<string, CircuitData>;
  activeFaults: FaultData[];
  deviceInfo: DeviceInfo | null;
  settings: Settings | null;
  isConnected: boolean;
  lastSeen: number;
  setAuthenticated: (value: boolean) => void;
  setOnboardingComplete: (value: boolean) => void;
  setLiveData: (data: LiveData) => void;
  setCircuitData: (circuitId: string, data: CircuitData) => void;
  setActiveFaults: (faults: FaultData[]) => void;
  setDeviceInfo: (info: DeviceInfo) => void;
  setSettings: (settings: Settings) => void;
  setConnected: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  deviceId: 'home_01',
  liveData: null,
  circuits: {},
  activeFaults: [],
  deviceInfo: null,
  settings: null,
  isConnected: true,
  lastSeen: Date.now(),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setOnboardingComplete: (value) => set({ hasCompletedOnboarding: value }),
  setLiveData: (data) => set({ liveData: data, lastSeen: Date.now() }),
  setCircuitData: (circuitId, data) =>
    set((state) => ({
      circuits: { ...state.circuits, [circuitId]: data },
    })),
  setActiveFaults: (faults) => set({ activeFaults: faults }),
  setDeviceInfo: (info) => set({ deviceInfo: info }),
  setSettings: (settings) => set({ settings: settings }),
  setConnected: (value) => set({ isConnected: value }),
}));
