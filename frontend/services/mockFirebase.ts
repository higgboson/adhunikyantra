// Mock Firebase Service
import { DEVICE_ID, DEFAULT_SETTINGS } from '../constants/circuit';
import type { LiveData, CircuitData, FaultData, DeviceInfo, Settings, FaultType } from '../types/firebase';

type Listener = (data: any) => void;

class MockFirebaseService {
  private listeners: Map<string, Set<Listener>> = new Map();
  private data: any = {};
  private dataGenerator: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    this.data = {
      devices: {
        [DEVICE_ID]: {
          live: {
            voltage_v: 230,
            leakage_ma: 0.3,
            total_power_w: 850,
            ambient_temp_c: 24.5,
            ambient_humidity: 52,
            timestamp: Date.now(),
          },
          circuits: {
            circuit_1: {
              name: 'Bedroom AC',
              current_a: 7.2,
              power_w: 1108,
              temp_c: 42,
              relay_state: true,
              fault_active: true,
              fault_type: 'overload',
              ewma_baseline: 900,
              ewma_trained: true,
              ewma_training_pct: 100,
            },
            circuit_2: {
              name: 'Kitchen',
              current_a: 1.9,
              power_w: 278,
              temp_c: 35,
              relay_state: true,
              fault_active: false,
              fault_type: 'none',
              ewma_baseline: 250,
              ewma_trained: true,
              ewma_training_pct: 100,
            },
            circuit_3: {
              name: 'Geyser',
              current_a: 0.8,
              power_w: 0,
              temp_c: 22,
              relay_state: false,
              fault_active: false,
              fault_type: 'none',
              ewma_baseline: 0,
              ewma_trained: false,
              ewma_training_pct: 45,
            },
            circuit_4: {
              name: 'Water Pump',
              current_a: 0.6,
              power_w: 0,
              temp_c: 28,
              relay_state: false,
              fault_active: true,
              fault_type: 'thermal',
              ewma_baseline: 500,
              ewma_trained: true,
              ewma_training_pct: 100,
            },
          },
          faults: {
            active: {
              fault_1: {
                type: 'overload',
                circuit: 'circuit_1',
                measured_value: 7.8,
                threshold: 6.0,
                timestamp: Date.now() - 120000,
                resolved: false,
              },
              fault_2: {
                type: 'thermal',
                circuit: 'circuit_4',
                measured_value: 68,
                threshold: 65,
                timestamp: Date.now() - 300000,
                resolved: false,
              },
            },
          },
          settings: DEFAULT_SETTINGS,
          device_info: {
            firmware_version: 'v4.0.2-GENESIS',
            hardware_id: 'AY-7711-X092',
            uptime_seconds: 1209600, // 14 days
            wifi_ssid: 'HomeWiFi_5G',
            ip_address: '192.168.1.156',
            spiffs_used_pct: 1,
            last_seen: Date.now(),
          },
        },
      },
    };
  }

  // Simulate real-time data updates every 2 seconds
  startDataGenerator() {
    if (this.dataGenerator) return;

    this.dataGenerator = setInterval(() => {
      const deviceData = this.data.devices[DEVICE_ID];
      
      // Update live data with realistic variations
      deviceData.live.voltage_v = 230 + (Math.random() - 0.5) * 4;
      deviceData.live.leakage_ma = 0.3 + (Math.random() - 0.5) * 0.2;
      deviceData.live.ambient_temp_c = 24.5 + (Math.random() - 0.5) * 1;
      deviceData.live.ambient_humidity = 52 + (Math.random() - 0.5) * 2;
      deviceData.live.timestamp = Date.now();
      
      // Update total power
      let totalPower = 0;
      Object.keys(deviceData.circuits).forEach((circuitKey) => {
        const circuit = deviceData.circuits[circuitKey];
        if (circuit.relay_state) {
          circuit.current_a = circuit.current_a + (Math.random() - 0.5) * 0.2;
          circuit.power_w = circuit.current_a * deviceData.live.voltage_v;
          circuit.temp_c = circuit.temp_c + (Math.random() - 0.5) * 0.5;
          totalPower += circuit.power_w;
        }
      });
      
      deviceData.live.total_power_w = totalPower;
      deviceData.device_info.last_seen = Date.now();

      // Notify listeners
      this.notifyListeners(`devices/${DEVICE_ID}/live`, deviceData.live);
      Object.keys(deviceData.circuits).forEach((circuitKey) => {
        this.notifyListeners(
          `devices/${DEVICE_ID}/circuits/${circuitKey}`,
          deviceData.circuits[circuitKey]
        );
      });
    }, 2000);
  }

  stopDataGenerator() {
    if (this.dataGenerator) {
      clearInterval(this.dataGenerator);
      this.dataGenerator = null;
    }
  }

  // Subscribe to a path
  onValue(path: string, callback: Listener) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path)!.add(callback);

    // Immediately call with current value
    const value = this.getValueAtPath(path);
    callback(value);

    // Return unsubscribe function
    return () => {
      this.listeners.get(path)?.delete(callback);
    };
  }

  // Write to a path
  async set(path: string, value: any): Promise<void> {
    this.setValueAtPath(path, value);
    this.notifyListeners(path, value);
  }

  private getValueAtPath(path: string): any {
    const parts = path.split('/');
    let current = this.data;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current;
  }

  private setValueAtPath(path: string, value: any) {
    const parts = path.split('/');
    let current = this.data;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }

  private notifyListeners(path: string, value: any) {
    const listeners = this.listeners.get(path);
    if (listeners) {
      listeners.forEach((callback) => callback(value));
    }
  }
}

export const mockFirebase = new MockFirebaseService();
