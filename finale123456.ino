// ============================================================
//  ADHUNIK YANTRA — FULLY CORRECTED VERSION
//  Fixed: scope errors, missing functions, global sensor vars
// ============================================================

#include <Wire.h>
#include <SPI.h>
#include <TFT_eSPI.h>
#include <Adafruit_ADS1X15.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// ── WIFI & FIREBASE ──────────────────────────────────────────
#define WIFI_SSID      "Galaxy A35 5G A3C4"
#define WIFI_PASSWORD  "Mudra123@#"
#define API_KEY        "AIzaSyB96JUzEQbI2vcacSsmxQN_CcoKie95Jac"
#define DATABASE_URL   "adhunikyantra-e2dee-default-rtdb.firebaseio.com"
#define DEVICE_ID      "device_001"

// ── HARDWARE PINS ────────────────────────────────────────────
#define RELAY_IN1 26
#define RELAY_IN2 27

// ── ADS1115 CHANNELS ─────────────────────────────────────────
#define CH_VOLTAGE  0
#define CH_CURR_1   1
#define CH_CURR_2   2
#define CH_NEUTRAL  3

// ── CALIBRATION ──────────────────────────────────────────────
float CAL_VOLTAGE = 0.711f;
float CAL_CURR_1  = 1.204f;
float CAL_CURR_2  = 0.127f;
float CAL_CURR_3  = 1.26f;

// ── FAULT THRESHOLDS ─────────────────────────────────────────
#define OVERCURRENT_A   15.0f
#define OVERVOLTAGE_V  260.0f
#define UNDERVOLTAGE_V 180.0f
#define LEAK_TRIP_MA    25.0f

// ── OBJECTS ──────────────────────────────────────────────────
Adafruit_ADS1115 ads;
TFT_eSPI tft = TFT_eSPI();
FirebaseData fbdo;
FirebaseData streamData1, streamData2;
FirebaseAuth fbAuth;
FirebaseConfig fbConfig;



// ── GLOBAL SENSOR READINGS ───────────────────────────────────
// FIX: these MUST be global so setTestFaultValues() can access them
float g_voltage     = 230.0f;
float g_current1    = 0.0f;
float g_current2    = 0.0f;
float g_currentNeut = 0.0f;
float g_leakageMA   = 0.0f;
float g_temperature = 28.5f;

// ── GLOBAL FAULT STATE ───────────────────────────────────────
// FIX: faultActive and faultType must be global
bool   faultActive = false;
String faultType   = "normal";

// ── RELAY STATE ──────────────────────────────────────────────
bool relay1State = true;
bool relay2State = true;

// ── ENERGY TRACKING ──────────────────────────────────────────
float totalEnergykWh    = 0.0f;
float circuit1EnergykWh = 0.0f;
float circuit2EnergykWh = 0.0f;
unsigned long lastEnergyUpdate = 0;
const float COST_PER_UNIT = 8.5f;

// ── FIREBASE STATE ───────────────────────────────────────────
bool firebaseConnected   = false;
unsigned long lastFirebaseSend = 0;
#define FIREBASE_SEND_MS 1000

// ── TEST MODE STATE ──────────────────────────────────────────
bool   testMode          = false;
String testFaultType     = "normal";
float  testVoltage       = 0.0f;
float  testCurrentHeavy  = 0.0f;
float  testCurrentLight  = 0.0f;
unsigned long testModeStartTime = 0;

// ── GRAPH VARIABLES ──────────────────────────────────────────
int   xPos        = 0;
int   prevY1      = 220;
int   prevY2      = 220;
float maxGraphAmps = 10.0f;

// ════════════════════════════════════════════════════════════
//   TEMPERATURE
// ════════════════════════════════════════════════════════════
float generateFakeTemperature() {
  static float baseTemp = 28.5f;
  static unsigned long lastChange = 0;
  if (millis() - lastChange >= 10000) {
    lastChange = millis();
    float variation = (random(100) / 100.0f) - 0.5f;
    baseTemp += variation;
    baseTemp = constrain(baseTemp, 25.0f, 35.0f);
  }
  return baseTemp + ((random(20) / 100.0f) - 0.1f);
}

// ════════════════════════════════════════════════════════════
//  RELAY CONTROL
// ════════════════════════════════════════════════════════════
void setRelay1(bool on) {
  digitalWrite(RELAY_IN2, on ? LOW : HIGH);
  relay1State = on;
  Serial.printf(">>> R1: %s\n", on ? "ON" : "OFF");
  if (firebaseConnected && Firebase.ready())
    Firebase.RTDB.setBool(&fbdo, ("/" + String(DEVICE_ID) + "/readings/relay1_on").c_str(), on);
}

void setRelay2(bool on) {
  digitalWrite(RELAY_IN1, on ? LOW : HIGH);
  relay2State = on;
  Serial.printf(">>> R2: %s\n", on ? "ON" : "OFF");
  if (firebaseConnected && Firebase.ready())
    Firebase.RTDB.setBool(&fbdo, ("/" + String(DEVICE_ID) + "/readings/relay2_on").c_str(), on);
}

// ── Trip and reset helpers ────────────────────────────────────
// FIX: tripRelay and shouldTripRelay were called but never defined
void tripRelay() {
  setRelay1(false);
  setRelay2(false);
  Serial.println("[FAULT] Relay tripped for safety");
}

bool shouldTripRelay(String fault) {
  return (fault == "overcurrent"          ||
          fault == "earth_leakage_critical"||
          fault == "short_circuit");
}

// ════════════════════════════════════════════════════════════
//  FIREBASE STREAMS
// ════════════════════════════════════════════════════════════
void initRelayStreams() {
  String p1 = "/" + String(DEVICE_ID) + "/relay/circuit_1";
  String p2 = "/" + String(DEVICE_ID) + "/relay/circuit_2";
  if (Firebase.RTDB.beginStream(&streamData1, p1.c_str()))
    Serial.println("[STREAM] C1: " + p1);
  if (Firebase.RTDB.beginStream(&streamData2, p2.c_str()))
    Serial.println("[STREAM] C2: " + p2);
}

void checkRelayStreams() {
  if (!firebaseConnected || !Firebase.ready()) return;

  if (Firebase.RTDB.readStream(&streamData1) && streamData1.streamAvailable()) {
    if (streamData1.dataTypeEnum() == fb_esp_rtdb_data_type_boolean) {
      bool state = streamData1.boolData();
      digitalWrite(RELAY_IN2, state ? LOW : HIGH);
      relay1State = state;
      Serial.printf("[STREAM] R1: %s\n", state ? "ON" : "OFF");
    }
  }

  if (Firebase.RTDB.readStream(&streamData2) && streamData2.streamAvailable()) {
    if (streamData2.dataTypeEnum() == fb_esp_rtdb_data_type_boolean) {
      bool state = streamData2.boolData();
      digitalWrite(RELAY_IN1, state ? LOW : HIGH);
      relay2State = state;
      Serial.printf("[STREAM] R2: %s\n", state ? "ON" : "OFF");
    }
  }

  if (!streamData1.httpConnected() || !streamData2.httpConnected())
    initRelayStreams();
}

// ════════════════════════════════════════════════════════════
//  FAULT DETECTION
//  FIX: detectFaults was called but never defined
// ════════════════════════════════════════════════════════════
String detectFaults(float voltage, float current, float leakMA) {
  if (leakMA   >= LEAK_TRIP_MA)                    return "earth_leakage_critical";
  if (current  >= OVERCURRENT_A)                   return "overcurrent";
  if (voltage  >= OVERVOLTAGE_V)                   return "overvoltage";
  if (voltage  <= UNDERVOLTAGE_V && voltage > 10)  return "undervoltage";
  return "normal";
}

// ════════════════════════════════════════════════════════════
//  DISPLAY FUNCTIONS
// ════════════════════════════════════════════════════════════
void drawAttractiveDisplay(float voltage, float current1, float current2, float temp) {
  static unsigned long lastDraw = 0;
  if (millis() - lastDraw < 50) return;
  lastDraw = millis();

  float power1     = voltage * current1;
  float power2     = voltage * current2;
  float totalPower = power1 + power2;

  tft.fillRect(0, 36, 320, 200, TFT_BLACK);

  tft.setTextColor(TFT_GREEN, TFT_BLACK);
  tft.setTextSize(2);
  tft.setCursor(10, 40);
  tft.print("ADHUNIK YANTRA");

  tft.setTextColor(TFT_YELLOW, TFT_BLACK);
  tft.setTextSize(3);
  tft.setCursor(10, 70);
  tft.print(voltage, 1);
  tft.setTextSize(2);
  tft.print(" V");

  tft.setTextColor(TFT_ORANGE, TFT_BLACK);
  tft.setCursor(180, 70);
  tft.print(temp, 1);
  tft.print("C");

  // Circuit 1
  tft.drawRect(5, 105, 150, 80, TFT_GREEN);
  tft.setTextColor(TFT_GREEN, TFT_BLACK);
  tft.setTextSize(2);
  tft.setCursor(15, 115); tft.print("Circuit 1");
  tft.setCursor(15, 140); tft.print("I: "); tft.print(current1, 2); tft.print(" A");
  tft.setCursor(15, 165); tft.print("P: "); tft.print(power1,   1); tft.print(" W");

  // Circuit 2
  tft.drawRect(165, 105, 150, 80, TFT_CYAN);
  tft.setTextColor(TFT_CYAN, TFT_BLACK);
  tft.setCursor(175, 115); tft.print("Circuit 2");
  tft.setCursor(175, 140); tft.print("I: "); tft.print(current2, 2); tft.print(" A");
  tft.setCursor(175, 165); tft.print("P: "); tft.print(power2,   1); tft.print(" W");

  tft.setTextColor(TFT_MAGENTA, TFT_BLACK);
  tft.setTextSize(2);
  tft.setCursor(80, 210);
  tft.print("Total: "); tft.print(totalPower, 1); tft.print(" W");

  // Live graph
  tft.drawLine(0, 235, 320, 235, TFT_DARKGREY);
  int yPos1 = 235 - (int)((current1 / maxGraphAmps) * 40);
  int yPos2 = 235 - (int)((current2 / maxGraphAmps) * 40);
  if (xPos > 0) {
    tft.drawPixel(xPos - 1, prevY1, TFT_GREEN);
    tft.drawPixel(xPos - 1, prevY2, TFT_CYAN);
  }
  prevY1 = yPos1;
  prevY2 = yPos2;
  xPos = (xPos + 1) % 320;
  if (xPos == 0) tft.fillRect(0, 236, 320, 4, TFT_BLACK);
}

// FIX: displayFault was called in loop() but never defined
void displayFault(String fault, float voltage, float current) {
  tft.fillScreen(TFT_RED);
  tft.fillRect(10, 10, 300, 220, TFT_BLACK);

  tft.setTextColor(TFT_RED, TFT_BLACK);
  tft.setTextSize(2);
  tft.setCursor(50, 30);
  tft.print("!! FAULT DETECTED !!");

  tft.setTextSize(3);
  tft.setCursor(20, 70);
  if      (fault == "overvoltage")           tft.print("OVERVOLTAGE");
  else if (fault == "undervoltage")          tft.print("UNDERVOLTAGE");
  else if (fault == "overcurrent")           tft.print("OVERCURRENT");
  else if (fault == "earth_leakage_critical")tft.print("EARTH LEAKAGE");
  else if (fault == "short_circuit")         tft.print("SHORT CIRCUIT");
  else                                       tft.print("FAULT");

  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setTextSize(2);
  tft.setCursor(20, 130);
  tft.print("V: "); tft.print(voltage, 1); tft.print(" V");
  tft.setCursor(20, 160);
  tft.print("I: "); tft.print(current, 2); tft.print(" A");

  tft.setTextColor(TFT_RED, TFT_BLACK);
  tft.setCursor(50, 200);
  tft.print("RELAY TRIPPED!");
}

// ════════════════════════════════════════════════════════════
//  TEST MODE DISPLAY
// ════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
//  TEST MODE DISPLAY (ATTRACTIVE VERSION)
// ════════════════════════════════════════════════════════════
void displayTestFault(String faultT) {
  // Define color schemes for different faults
  uint16_t bgColor, textColor, borderColor, subTextColor;
  
  if (faultT == "overvoltage") {
    // 🔴 RED theme for Overvoltage
    bgColor       = 0xB800;     // Dark Red
    textColor     = TFT_WHITE;
    borderColor   = TFT_RED;
    subTextColor  = 0xFFE0;     // Light Yellow
  }
  else if (faultT == "undervoltage") {
    // 🟠 ORANGE theme for Undervoltage
    bgColor       = 0xFD20;     // Dark Orange
    textColor     = TFT_WHITE;
    borderColor   = TFT_ORANGE;
    subTextColor  = 0xFDA0;     // Light Orange
  }
  else if (faultT == "overcurrent") {
    // 🔥 RED/ORANGE theme for Overcurrent
    bgColor       = 0x8000;     // Maroon
    textColor     = TFT_WHITE;
    borderColor   = 0xFD00;     // Bright Orange
    subTextColor  = 0xFF80;     // Peach
  }
  else if (faultT == "leakage") {
    // 🟣 PURPLE theme for Earth Leakage
    bgColor       = 0x801F;     // Dark Purple
    textColor     = TFT_WHITE;
    borderColor   = 0x07FF;     // Magenta
    subTextColor  = 0x83FF;     // Light Purple
  }
  else if (faultT == "short_circuit") {
    // 🔴 CRIMSON theme for Short Circuit
    bgColor       = 0xA000;     // Dark Crimson
    textColor     = TFT_WHITE;
    borderColor   = TFT_RED;
    subTextColor  = 0xFFE0;     // Light Yellow
  }
  else {
    // Default - GRAY theme
    bgColor       = 0x4208;     // Dark Gray
    textColor     = TFT_WHITE;
    borderColor   = TFT_WHITE;
    subTextColor  = 0x8410;     // Light Gray
  }
  
  // Fill background
  tft.fillScreen(bgColor);
  
  // Draw border frame
  tft.drawRect(5, 5, 310, 230, borderColor);
  tft.drawRect(10, 10, 300, 220, borderColor);
  
  // Draw decorative corner elements
  tft.fillRect(15, 15, 30, 5, borderColor);
  tft.fillRect(15, 15, 5, 30, borderColor);
  tft.fillRect(270, 15, 30, 5, borderColor);
  tft.fillRect(305, 15, 5, 30, borderColor);
  tft.fillRect(15, 205, 30, 5, borderColor);
  tft.fillRect(15, 225, 5, 15, borderColor);
  tft.fillRect(270, 205, 30, 5, borderColor);
  tft.fillRect(305, 225, 5, 15, borderColor);
  
  // Header - TEST MODE FAULT
  tft.setTextColor(borderColor, bgColor);
  tft.setTextSize(2);
  tft.setTextDatum(MC_DATUM);  // Middle center alignment
  tft.drawString("⚠️ TEST MODE FAULT ⚠️", 160, 35);
  
  // Main fault name (LARGE and BOLD)
  tft.setTextColor(textColor, bgColor);
  tft.setTextSize(3);
  
  if (faultT == "overvoltage") {
    tft.drawString("OVERVOLTAGE", 160, 90);
  }
  else if (faultT == "undervoltage") {
    tft.drawString("UNDERVOLTAGE", 160, 90);
  }
  else if (faultT == "overcurrent") {
    tft.drawString("OVERCURRENT", 160, 90);
  }
  else if (faultT == "leakage") {
    tft.drawString("EARTH LEAKAGE", 160, 90);
  }
  else if (faultT == "short_circuit") {
    tft.drawString("SHORT CIRCUIT", 160, 90);
  }
  
  // Demo notice
  tft.setTextColor(subTextColor, bgColor);
  tft.setTextSize(1);
  tft.drawString("═══════════════════════════", 160, 130);
  tft.drawString("DEMO - NOT A REAL FAULT", 160, 145);
  tft.drawString("═══════════════════════════", 160, 160);
  
  // Fault description
  tft.setTextSize(1);
  tft.setTextColor(subTextColor, bgColor);
  
  if (faultT == "overvoltage") {
    tft.drawString("Voltage exceeds 260V", 160, 175);
    tft.drawString("Equipment damage risk", 160, 190);
  }
  else if (faultT == "undervoltage") {
    tft.drawString("Voltage below 180V", 160, 175);
    tft.drawString("Motor/compressor risk", 160, 190);
  }
  else if (faultT == "overcurrent") {
    tft.drawString("Current exceeds 15A", 160, 175);
    tft.drawString("Overload protection", 160, 190);
  }
  else if (faultT == "leakage") {
    tft.drawString("Leakage current >= 25mA", 160, 175);
    tft.drawString("Electric shock risk", 160, 190);
  }
  else if (faultT == "short_circuit") {
    tft.drawString("Massive current spike", 160, 175);
    tft.drawString("Fire hazard - immediate trip", 160, 190);
  }
  
  // Relay status (BOTTOM - LARGE)
  tft.setTextColor(borderColor, bgColor);
  tft.setTextSize(2);
  tft.setTextDatum(MC_DATUM);
  tft.drawString("🔌 RELAY TRIPPED!", 160, 220);
  
  // Reset text datum to default
  tft.setTextDatum(TL_DATUM);
}
// ════════════════════════════════════════════════════════════
//  BUZZER - DISTINCT SOUNDS FOR EACH FAULT TYPE (ACTIVE-HIGH)
// ════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
//  BUZZER - DISTINCT SOUNDS FOR EACH FAULT TYPE (FIXED)
// ════════════════════════════════════════════════════════════
#define BUZZER_PIN 32

// Buzzer pattern variables
unsigned long lastBeepTime = 0;
bool buzzerOn = false;
int beepCount = 0;



// Define distinct patterns for each fault
void updateBuzzer() {
  if (!faultActive) {
    noTone(BUZZER_PIN);
    buzzerOn = false;
    beepCount = 0;
    lastBeepTime = 0;
    return;
  }

  // Select pattern
  int onTime, offTime, maxBeeps, pauseTime, freq;
  if      (faultType == "overvoltage")             { onTime=150; offTime=150; maxBeeps=3; pauseTime=1000; freq=2000; }
  else if (faultType == "undervoltage")            { onTime=400; offTime=300; maxBeeps=2; pauseTime=1500; freq=1000; }
  else if (faultType == "overcurrent")             { onTime=200; offTime=200; maxBeeps=4; pauseTime=800;  freq=1500; }
  else if (faultType.indexOf("leakage") >= 0)      { onTime=100; offTime=100; maxBeeps=5; pauseTime=500;  freq=2500; }
  else if (faultType == "short_circuit")           { onTime=80;  offTime=80;  maxBeeps=10;pauseTime=200;  freq=3000; }
  else                                             { onTime=200; offTime=200; maxBeeps=3; pauseTime=1000; freq=1500; }

  unsigned long now = millis();

  // Not started yet
  if (lastBeepTime == 0) {
    lastBeepTime = now;
    beepCount = 0;
    buzzerOn = false;
  }

  unsigned long elapsed = now - lastBeepTime;

  if (!buzzerOn) {
    // Waiting for next beep
    unsigned long waitTime = (beepCount == 0) ? 0 : offTime;
    // After full set of beeps, use pause time
    if (beepCount >= maxBeeps) waitTime = pauseTime;

    if (elapsed >= (unsigned long)waitTime) {
      if (beepCount >= maxBeeps) {
        // Reset for next sequence
        beepCount = 0;
      }
      // Turn buzzer ON
      tone(BUZZER_PIN, freq);
      buzzerOn = true;
      lastBeepTime = now;
    }
  } else {
    // Buzzer is ON — wait for onTime to expire
    if (elapsed >= (unsigned long)onTime) {
      noTone(BUZZER_PIN);
      buzzerOn = false;
      beepCount++;
      lastBeepTime = now;
    }
  }
}
//  ENERGY UPDATE
// ════════════════════════════════════════════════════════════
void updateEnergy(float current1, float current2, float voltage) {
  if (millis() - lastEnergyUpdate < 1000) return;
  lastEnergyUpdate = millis();

  circuit1EnergykWh += (voltage * current1) / 1000.0f / 3600.0f;
  circuit2EnergykWh += (voltage * current2) / 1000.0f / 3600.0f;
  totalEnergykWh     = circuit1EnergykWh + circuit2EnergykWh;
}

// ════════════════════════════════════════════════════════════
//  RMS MEASUREMENT
// ════════════════════════════════════════════════════════════
float getChannelRMS(uint8_t channel, adsGain_t gain) {
  ads.setGain(gain);

  long offsetSum = 0;
  for (int i = 0; i < 50; i++)
    offsetSum += ads.readADC_SingleEnded(channel);
  float offset = offsetSum / 50.0f;

  double sumSq = 0;
  int n = 0;
  unsigned long t0 = micros();
  while (micros() - t0 < 20000) {
    float s = ads.readADC_SingleEnded(channel) - offset;
    sumSq += (double)(s * s);
    n++;
  }
  return (n > 0) ? sqrtf(sumSq / n) : 0.0f;
}

// ════════════════════════════════════════════════════════════
//  FIREBASE UPLOAD
// ════════════════════════════════════════════════════════════
void sendToFirebase(float voltage, float c1, float c2, float temp, float neutral, float leakage) {
  if (!firebaseConnected || !Firebase.ready()) return;

  String base = "/" + String(DEVICE_ID) + "/readings/";
  Firebase.RTDB.setFloat(&fbdo, (base+"voltage").c_str(),         voltage);
  Firebase.RTDB.setFloat(&fbdo, (base+"current1").c_str(),        c1);
  Firebase.RTDB.setFloat(&fbdo, (base+"current2").c_str(),        c2);
  Firebase.RTDB.setFloat(&fbdo, (base+"currentNeutral").c_str(),  neutral);
  Firebase.RTDB.setFloat(&fbdo, (base+"leakage_mA").c_str(),      leakage);
  Firebase.RTDB.setFloat(&fbdo, (base+"power1").c_str(),          voltage*c1);
  Firebase.RTDB.setFloat(&fbdo, (base+"power2").c_str(),          voltage*c2);
  Firebase.RTDB.setFloat(&fbdo, (base+"totalPower").c_str(),      voltage*(c1+c2));
  Firebase.RTDB.setFloat(&fbdo, (base+"temperature").c_str(),     temp);
  Firebase.RTDB.setFloat(&fbdo, (base+"totalEnergy_kWh").c_str(), totalEnergykWh);
  Firebase.RTDB.setFloat(&fbdo, (base+"circuit1Energy_kWh").c_str(), circuit1EnergykWh);
  Firebase.RTDB.setFloat(&fbdo, (base+"circuit2Energy_kWh").c_str(), circuit2EnergykWh);
  Firebase.RTDB.setFloat(&fbdo, (base+"totalCost").c_str(),       totalEnergykWh * COST_PER_UNIT);
  Firebase.RTDB.setBool (&fbdo, (base+"relay1_on").c_str(),       relay1State);
  Firebase.RTDB.setBool (&fbdo, (base+"relay2_on").c_str(),       relay2State);
  Firebase.RTDB.setBool (&fbdo, (base+"faultActive").c_str(),     faultActive);
  Firebase.RTDB.setString(&fbdo,(base+"faultMessage").c_str(),    faultType);
  Firebase.RTDB.setInt  (&fbdo, (base+"timestamp").c_str(),       millis());

  Serial.printf("[FB] V=%.1f I1=%.2f I2=%.2f P=%.1f T=%.1f Fault=%s\n",
                voltage, c1, c2, voltage*(c1+c2), temp, faultType.c_str());
}

// ════════════════════════════════════════════════════════════
//  TEST MODE — set simulated fault values
//  FIX: now uses global g_voltage, g_current1, g_current2
// ════════════════════════════════════════════════════════════
void setTestFaultValues(String faultT) {
  if (faultT == "overvoltage") {
    testVoltage      = 265.0f;
    testCurrentHeavy = g_current1;   // keep actual current
    testCurrentLight = g_current2;
  }
  else if (faultT == "undervoltage") {
    testVoltage      = 175.0f;
    testCurrentHeavy = g_current1;
    testCurrentLight = g_current2;
  }
  else if (faultT == "overcurrent") {
    testVoltage      = g_voltage;
    testCurrentHeavy = 16.5f;        // above 15A threshold
    testCurrentLight = g_current2;
  }
  else if (faultT == "leakage") {
    testVoltage      = g_voltage;
    testCurrentHeavy = 2.5f;
    testCurrentLight = 2.45f;        // 50mA leakage difference
  }
  else if (faultT == "short_circuit") {
    testVoltage      = g_voltage;
    testCurrentHeavy = 45.0f;
    testCurrentLight = 0.0f;
  }
  else {
    testVoltage      = g_voltage;
    testCurrentHeavy = g_current1;
    testCurrentLight = g_current2;
  }
}

void checkTestModeCommands() {
  if (!firebaseConnected || !Firebase.ready()) return;

  static String lastCmd = "";
  if (Firebase.RTDB.getString(&fbdo, "/" + String(DEVICE_ID) + "/commands/test_fault")) {
    String cmd = fbdo.stringData();
    if (cmd != "" && cmd != lastCmd) {
      lastCmd = cmd;
      Serial.printf("[TEST] Command: %s\n", cmd.c_str());
      if (cmd == "normal") {
        testMode     = false;
        testFaultType = "normal";
        Serial.println("[TEST] Deactivated");
      } else {
        testMode          = true;
        testFaultType     = cmd;
        testModeStartTime = millis();
        setTestFaultValues(cmd);
        
        Serial.printf("[TEST] Activated: %s\n", cmd.c_str());
      }
      Firebase.RTDB.setString(&fbdo,
        ("/" + String(DEVICE_ID) + "/commands/test_fault").c_str(), "");
    }
  }
}

void applyTestModeValues(float &voltage, float &cHeavy, float &cLight) {
  if (testMode) {
    voltage = testVoltage;
    cHeavy  = testCurrentHeavy;
    cLight  = testCurrentLight;
  }
}

// ════════════════════════════════════════════════════════════
//  SETUP
// ════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);

  pinMode(RELAY_IN1, OUTPUT);
  pinMode(RELAY_IN2, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
 noTone(BUZZER_PIN); // Start silent
  

  // Start with relays ON
  digitalWrite(RELAY_IN1, LOW);
  digitalWrite(RELAY_IN2, LOW);
  relay1State = relay2State = true;

  tft.init();
  tft.setRotation(3);
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_GREEN, TFT_BLACK);
  tft.setTextSize(2);
  tft.setCursor(50, 100);
  tft.print("Starting...");

  Wire.begin(21, 22);
  ads.setDataRate(RATE_ADS1115_860SPS);
  if (!ads.begin(0x48)) {
    tft.fillScreen(TFT_RED);
    tft.setCursor(10, 100);
    tft.print("ADS1115 FAIL");
    Serial.println("[FAIL] ADS1115 not found");
    while (1);
  }
  Serial.println("[OK] ADS1115");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[WiFi] Connecting");
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries++ < 15) {
    delay(300); Serial.print(".");
  }
  Serial.println(WiFi.status() == WL_CONNECTED ? "\n[WiFi] OK" : "\n[WiFi] Failed");

  fbConfig.api_key      = API_KEY;
  fbConfig.database_url = DATABASE_URL;
  fbConfig.token_status_callback = tokenStatusCallback;
  if (Firebase.signUp(&fbConfig, &fbAuth, "", "")) {
    firebaseConnected = true;
    Firebase.begin(&fbConfig, &fbAuth);
    Firebase.reconnectWiFi(true);
    Serial.println("[Firebase] OK");
    initRelayStreams();
  }

  randomSeed(analogRead(0));
  tft.fillScreen(TFT_BLACK);
  Serial.println("[BOOT] Ready");
}

// ════════════════════════════════════════════════════════════
//  LOOP
// ════════════════════════════════════════════════════════════
void loop() {
  // 1. Check test mode commands from Firebase
  checkTestModeCommands();

  // 2. Read real sensors into GLOBAL variables
  float rawV = getChannelRMS(CH_VOLTAGE, GAIN_ONE);
  g_voltage = rawV * 0.000125f * CAL_VOLTAGE * 1000.0f;
  if (g_voltage < 30.0f) g_voltage = 0.0f;

  float rawI1 = getChannelRMS(CH_CURR_1, GAIN_EIGHT);
  g_current1  = rawI1 * 0.0001105f * CAL_CURR_1;
  if (g_current1 < 0.03f) g_current1 = 0.0f;

  float rawI2 = getChannelRMS(CH_CURR_2, GAIN_EIGHT);
  g_current2  = rawI2 * 0.0001105f * CAL_CURR_2;
  if (g_current2 < 0.02f) g_current2 = 0.0f;

  float rawNeut   = getChannelRMS(CH_NEUTRAL, GAIN_EIGHT);
  g_currentNeut   = rawNeut * 0.0001105f * CAL_CURR_3;
  if (g_currentNeut < 0.02f) g_currentNeut = 0.0f;

// Leakage = |Live - Neutral|
  g_leakageMA = fabsf(g_current1 - g_currentNeut) * 1000.0f;
  if (g_leakageMA < 1.5f) g_leakageMA = 0.0f;

  g_temperature = generateFakeTemperature();

  // 3. Working copies for this loop iteration
  float voltage      = g_voltage;
  float currentHeavy = g_current1;
  float currentLight = g_current2;

  // 4. Override with test values if test mode active
  applyTestModeValues(voltage, currentHeavy, currentLight);
  if (!relay1State) {
    currentHeavy = 0.0f;
    g_current1 = 0.0f;
  }
  if (!relay2State) {
    currentLight = 0.0f;
    g_current2 = 0.0f;
  }

  // 5. Fault detection
  // In test mode use testFaultType directly
  // In normal mode detect from real (or overridden) values
  String detectedFault;
  if (testMode) {
    detectedFault = testFaultType;
    // Leakage test: inject fake leakage
    if (testFaultType == "leakage")
      g_leakageMA = 50.0f;
    else
      g_leakageMA = 0.0f;
  } else {
    g_leakageMA   = 0.0f;  // neutral CT not connected
    detectedFault = detectFaults(voltage, currentHeavy, g_leakageMA);
  }

  // 6. Update fault state
  if (detectedFault != "normal") {
    faultActive = true;
    faultType   = detectedFault;

    if (testMode)
      displayTestFault(testFaultType);
    else
      displayFault(faultType, voltage, currentHeavy);

    if (shouldTripRelay(faultType))
      tripRelay();

  } else {
    faultActive = false;
    faultType   = "normal";
    if (!testMode)
      drawAttractiveDisplay(voltage, currentHeavy, currentLight, g_temperature);
  }

  // 7. Buzzer
  updateBuzzer();

  // 8. Energy
  updateEnergy(currentHeavy, currentLight, voltage);

  // 9. Firebase relay streams
  checkRelayStreams();

  // 10. Firebase upload
  if (firebaseConnected && millis() - lastFirebaseSend >= FIREBASE_SEND_MS) {
    lastFirebaseSend = millis();
    sendToFirebase(voltage, currentHeavy, currentLight,
                   g_temperature, g_currentNeut, g_leakageMA);
  }

  // 11. Serial debug
  static unsigned long lastDebug = 0;
  if (millis() - lastDebug >= 1000) {
    lastDebug = millis();
    Serial.printf("Mode:%s | Fault:%s | V:%.1f | I1:%.2f I2:%.2f | E:%.4fkWh\n",
                  testMode ? "TEST" : "LIVE",
                  faultType.c_str(),
                  voltage, currentHeavy, currentLight,
                  totalEnergykWh);
  }
}
