export const NUM_CIRCUITS = 4;

export const CURRENT_THRESHOLDS = {
  ORANGE: 4.0,
  RED: 5.5,
};

export const TEMP_THRESHOLDS = {
  ORANGE: 50.0,
  RED: 60.0,
};

export const CURRENT_BAR_PCT = {
  ORANGE: 0.70,
  RED: 0.90,
};

export const EWMA_SAMPLE_COUNT = 200;

export const DEVICE_ID = 'home_01';

export const DEFAULT_SETTINGS = {
  overload_limit_a: 6.0,
  short_circuit_limit_a: 18.0,
  overvoltage_v: 260.0,
  undervoltage_v: 180.0,
  leakage_limit_ma: 30.0,
  thermal_limit_c: 65.0,
  electricity_rate_rs: 8.0,
};
