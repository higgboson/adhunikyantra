class AppConstants {
  // App Info
  static const String appName = 'ADHUNIK YANTRA';
  static const String tagline = 'Smart Home. Safe Home.';
  static const String deviceId = 'device_001';
  
  // Timing
  static const Duration splashDuration = Duration(seconds: 2);
  static const Duration reconnectTimeout = Duration(seconds: 30);
  static const Duration firebaseUpdateInterval = Duration(seconds: 2);
  static const Duration deviceInfoUpdateInterval = Duration(seconds: 30);
  
  // Thresholds (defaults)
  static const double defaultOverloadLimitA = 6.0;
  static const double defaultShortCircuitLimitA = 18.0;
  static const double defaultOvervoltageV = 260.0;
  static const double defaultUndervoltageV = 180.0;
  static const double defaultLeakageLimitMa = 30.0;
  static const double defaultThermalLimitC = 65.0;
  static const double defaultElectricityRateRs = 8.0;
  
  // Circuit count
  static const int circuitCount = 4;
  static const List<String> circuitIds = ['circuit_1', 'circuit_2', 'circuit_3', 'circuit_4'];
  
  // SharedPreferences keys
  static const String prefDeviceId = 'device_id';
  static const String prefOnboardingComplete = 'onboarding_complete';
  static const String prefCircuitNames = 'circuit_names';
  static const String prefAuthToken = 'auth_token';
  
  // Circuit default names
  static const Map<String, String> defaultCircuitNames = {
    'circuit_1': 'Living Room',
    'circuit_2': 'Kitchen',
    'circuit_3': 'Bedroom',
    'circuit_4': 'AC Unit',
  };
  
  // EWMA
  static const double ewmaAnomalyMultiplier = 1.2;
  static const List<int> calibrationDurations = [24, 48, 72, 168]; // hours
  static const int defaultCalibrationHours = 48;
  
  // Voltage
  static const double minNormalVoltage = 200.0;
  static const double maxNormalVoltage = 250.0;
}
