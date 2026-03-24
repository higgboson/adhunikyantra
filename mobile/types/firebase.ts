export interface LiveData {
  voltage_v: number;
  leakage_ma: number;
  total_power_w: number;
  ambient_temp_c: number;
  ambient_humidity: number;
  timestamp: number;
}

export interface CircuitData {
  name: string;
  current_a: number;
  power_w: number;
  temp_c: number;
  relay_state: boolean;
  fault_active: boolean;
  fault_type: FaultType;
  ewma_baseline: number;
  ewma_trained: boolean;
  ewma_training_pct: number;
}

export type FaultType =
  | 'overload'
  | 'short'
  | 'overvoltage'
  | 'undervoltage'
  | 'leakage'
  | 'thermal'
  | 'none';

export interface FaultData {
  id: string;
  type: FaultType;
  circuit: string;
  measured_value: number;
  threshold: number;
  timestamp: number;
  resolved: boolean;
}

export interface DeviceInfo {
  firmware_version: string;
  hardware_id: string;
  uptime_seconds: number;
  wifi_ssid: string;
  ip_address: string;
  spiffs_used_pct: number;
  last_seen: number;
}

export interface Settings {
  overload_limit_a: number;
  short_circuit_limit_a: number;
  overvoltage_v: number;
  undervoltage_v: number;
  leakage_limit_ma: number;
  thermal_limit_c: number;
  electricity_rate_rs: number;
}

export interface NeutralMonitorData {
  live_current_a: number;
  neutral_current_a: number;
  difference_ma: number;
  fault_active: boolean;
}
