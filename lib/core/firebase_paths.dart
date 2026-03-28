class FirebasePaths {
  // FIXED: Removed the 'devices/' prefix. 
  // ESP32 writes directly to the root: /device_001
  static String deviceRoot(String deviceId) => deviceId;
  
  // FIXED: Mapped to the 'readings' folder the ESP32 uses
  static String live(String deviceId) => '$deviceId/readings';
  
  // Note: These individual live getters aren't strictly needed anymore since 
  // your liveDataProvider grabs the whole 'readings' folder at once, but we will 
  // update them to match ESP32 just in case you use them elsewhere!
  static String liveVoltage(String deviceId) => '$deviceId/readings/voltage';
  static String livePower(String deviceId) => '$deviceId/readings/power';
  static String liveLeakage(String deviceId) => '$deviceId/readings/current1';
  static String liveTemp(String deviceId) => '$deviceId/readings/ambient_temp_c';
  static String liveTimestamp(String deviceId) => '$deviceId/readings/timestamp';
  
  // Circuits
  static String circuits(String deviceId) => '$deviceId/circuits';
  static String circuit(String deviceId, String circuitId) => '$deviceId/circuits/$circuitId';
  static String circuitName(String deviceId, String circuitId) => '$deviceId/circuits/$circuitId/name';
  static String circuitCurrent(String deviceId, String circuitId) => '$deviceId/circuits/$circuitId/current_a';
  static String circuitPower(String deviceId, String circuitId) => '$deviceId/circuits/$circuitId/power_w';
  static String circuitTemp(String deviceId, String circuitId) => '$deviceId/circuits/$circuitId/temp_c';
  
  // FIXED: Mapped to the 'relay/1' folder the ESP32 is listening to
  static String circuitRelay(String deviceId, String circuitId) => '$deviceId/relay/$circuitId';
  
  static String circuitFaultActive(String deviceId, String circuitId) => '$deviceId/circuits/$circuitId/fault_active';
  static String circuitFaultType(String deviceId, String circuitId) => '$deviceId/circuits/$circuitId/fault_type';
  static String circuitEwmaBaseline(String deviceId, String circuitId) => '$deviceId/circuits/$circuitId/ewma_baseline';
  static String circuitEwmaTrained(String deviceId, String circuitId) => '$deviceId/circuits/$circuitId/ewma_trained';
  static String circuitEwmaTrainingPct(String deviceId, String circuitId) => '$deviceId/circuits/$circuitId/ewma_training_pct';
  
  // Faults
  static String faults(String deviceId) => '$deviceId/faults/active';
  static String fault(String deviceId, String faultId) => '$deviceId/faults/active/$faultId';
  static String faultResolved(String deviceId, String faultId) => '$deviceId/faults/active/$faultId/resolved';
  
  // History
  static String history(String deviceId) => '$deviceId/history';
  static String historyDate(String deviceId, String date) => '$deviceId/history/$date';
  static String historyHour(String deviceId, String date, String hour) => '$deviceId/history/$date/$hour';
  
  // Settings
  static String settings(String deviceId) => '$deviceId/settings';
  static String settingsOverload(String deviceId) => '$deviceId/settings/overload_limit_a';
  static String settingsShortCircuit(String deviceId) => '$deviceId/settings/short_circuit_limit_a';
  static String settingsOvervoltage(String deviceId) => '$deviceId/settings/overvoltage_v';
  static String settingsUndervoltage(String deviceId) => '$deviceId/settings/undervoltage_v';
  static String settingsLeakage(String deviceId) => '$deviceId/settings/leakage_limit_ma';
  static String settingsThermal(String deviceId) => '$deviceId/settings/thermal_limit_c';
  static String settingsRate(String deviceId) => '$deviceId/settings/electricity_rate_rs';
  
  // EWMA
  static String ewma(String deviceId) => '$deviceId/ewma';
  static String ewmaCircuit(String deviceId, String circuitId) => '$deviceId/ewma/$circuitId';
  static String ewmaAlpha(String deviceId, String circuitId) => '$deviceId/ewma/$circuitId/alpha';
  static String ewmaBaseline(String deviceId, String circuitId) => '$deviceId/ewma/$circuitId/baseline_w';
  static String ewmaMinOn(String deviceId, String circuitId) => '$deviceId/ewma/$circuitId/min_on_minutes';
  static String ewmaCalibrating(String deviceId, String circuitId) => '$deviceId/ewma/$circuitId/calibrating';
  static String ewmaCalibrationHours(String deviceId, String circuitId) => '$deviceId/ewma/$circuitId/calibration_hours';
  
  // Neutral Monitor
  static String neutralMonitor(String deviceId) => '$deviceId/neutral_monitor';
  static String neutralLive(String deviceId) => '$deviceId/neutral_monitor/live_current_a';
  static String neutralCurrent(String deviceId) => '$deviceId/neutral_monitor/neutral_current_a';
  static String neutralDifference(String deviceId) => '$deviceId/neutral_monitor/difference_ma';
  static String neutralFault(String deviceId) => '$deviceId/neutral_monitor/fault_active';
  
  // Device Info
  static String deviceInfo(String deviceId) => '$deviceId/device_info';
  static String deviceFirmware(String deviceId) => '$deviceId/device_info/firmware_version';
  static String deviceHardware(String deviceId) => '$deviceId/device_info/hardware_id';
  static String deviceUptime(String deviceId) => '$deviceId/device_info/uptime_seconds';
  static String deviceIp(String deviceId) => '$deviceId/device_info/ip_address';
  static String deviceLastSeen(String deviceId) => '$deviceId/device_info/last_seen';
  static String deviceStorage(String deviceId) => '$deviceId/device_info/spiffs_used_pct';
}