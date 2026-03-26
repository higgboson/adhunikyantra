class FirebasePaths {
  // Device root
  static String deviceRoot(String deviceId) => 'devices/$deviceId';
  
  // Live data
  static String live(String deviceId) => 'devices/$deviceId/live';
  static String liveVoltage(String deviceId) => 'devices/$deviceId/live/voltage_v';
  static String livePower(String deviceId) => 'devices/$deviceId/live/total_power_w';
  static String liveLeakage(String deviceId) => 'devices/$deviceId/live/leakage_ma';
  static String liveTemp(String deviceId) => 'devices/$deviceId/live/ambient_temp_c';
  static String liveTimestamp(String deviceId) => 'devices/$deviceId/live/timestamp';
  
  // Circuits
  static String circuits(String deviceId) => 'devices/$deviceId/circuits';
  static String circuit(String deviceId, String circuitId) => 'devices/$deviceId/circuits/$circuitId';
  static String circuitName(String deviceId, String circuitId) => 'devices/$deviceId/circuits/$circuitId/name';
  static String circuitCurrent(String deviceId, String circuitId) => 'devices/$deviceId/circuits/$circuitId/current_a';
  static String circuitPower(String deviceId, String circuitId) => 'devices/$deviceId/circuits/$circuitId/power_w';
  static String circuitTemp(String deviceId, String circuitId) => 'devices/$deviceId/circuits/$circuitId/temp_c';
  static String circuitRelay(String deviceId, String circuitId) => 'devices/$deviceId/circuits/$circuitId/relay_state';
  static String circuitFaultActive(String deviceId, String circuitId) => 'devices/$deviceId/circuits/$circuitId/fault_active';
  static String circuitFaultType(String deviceId, String circuitId) => 'devices/$deviceId/circuits/$circuitId/fault_type';
  static String circuitEwmaBaseline(String deviceId, String circuitId) => 'devices/$deviceId/circuits/$circuitId/ewma_baseline';
  static String circuitEwmaTrained(String deviceId, String circuitId) => 'devices/$deviceId/circuits/$circuitId/ewma_trained';
  static String circuitEwmaTrainingPct(String deviceId, String circuitId) => 'devices/$deviceId/circuits/$circuitId/ewma_training_pct';
  
  // Faults
  static String faults(String deviceId) => 'devices/$deviceId/faults/active';
  static String fault(String deviceId, String faultId) => 'devices/$deviceId/faults/active/$faultId';
  static String faultResolved(String deviceId, String faultId) => 'devices/$deviceId/faults/active/$faultId/resolved';
  
  // History
  static String history(String deviceId) => 'devices/$deviceId/history';
  static String historyDate(String deviceId, String date) => 'devices/$deviceId/history/$date';
  static String historyHour(String deviceId, String date, String hour) => 'devices/$deviceId/history/$date/$hour';
  
  // Settings
  static String settings(String deviceId) => 'devices/$deviceId/settings';
  static String settingsOverload(String deviceId) => 'devices/$deviceId/settings/overload_limit_a';
  static String settingsShortCircuit(String deviceId) => 'devices/$deviceId/settings/short_circuit_limit_a';
  static String settingsOvervoltage(String deviceId) => 'devices/$deviceId/settings/overvoltage_v';
  static String settingsUndervoltage(String deviceId) => 'devices/$deviceId/settings/undervoltage_v';
  static String settingsLeakage(String deviceId) => 'devices/$deviceId/settings/leakage_limit_ma';
  static String settingsThermal(String deviceId) => 'devices/$deviceId/settings/thermal_limit_c';
  static String settingsRate(String deviceId) => 'devices/$deviceId/settings/electricity_rate_rs';
  
  // EWMA
  static String ewma(String deviceId) => 'devices/$deviceId/ewma';
  static String ewmaCircuit(String deviceId, String circuitId) => 'devices/$deviceId/ewma/$circuitId';
  static String ewmaAlpha(String deviceId, String circuitId) => 'devices/$deviceId/ewma/$circuitId/alpha';
  static String ewmaBaseline(String deviceId, String circuitId) => 'devices/$deviceId/ewma/$circuitId/baseline_w';
  static String ewmaMinOn(String deviceId, String circuitId) => 'devices/$deviceId/ewma/$circuitId/min_on_minutes';
  static String ewmaCalibrating(String deviceId, String circuitId) => 'devices/$deviceId/ewma/$circuitId/calibrating';
  static String ewmaCalibrationHours(String deviceId, String circuitId) => 'devices/$deviceId/ewma/$circuitId/calibration_hours';
  
  // Neutral Monitor
  static String neutralMonitor(String deviceId) => 'devices/$deviceId/neutral_monitor';
  static String neutralLive(String deviceId) => 'devices/$deviceId/neutral_monitor/live_current_a';
  static String neutralCurrent(String deviceId) => 'devices/$deviceId/neutral_monitor/neutral_current_a';
  static String neutralDifference(String deviceId) => 'devices/$deviceId/neutral_monitor/difference_ma';
  static String neutralFault(String deviceId) => 'devices/$deviceId/neutral_monitor/fault_active';
  
  // Device Info
  static String deviceInfo(String deviceId) => 'devices/$deviceId/device_info';
  static String deviceFirmware(String deviceId) => 'devices/$deviceId/device_info/firmware_version';
  static String deviceHardware(String deviceId) => 'devices/$deviceId/device_info/hardware_id';
  static String deviceUptime(String deviceId) => 'devices/$deviceId/device_info/uptime_seconds';
  static String deviceIp(String deviceId) => 'devices/$deviceId/device_info/ip_address';
  static String deviceLastSeen(String deviceId) => 'devices/$deviceId/device_info/last_seen';
  static String deviceStorage(String deviceId) => 'devices/$deviceId/device_info/spiffs_used_pct';
}
