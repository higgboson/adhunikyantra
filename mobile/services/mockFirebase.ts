import { DEVICE_ID, DEFAULT_SETTINGS } from '@/constants/circuit';
import type { LiveData, CircuitData, FaultData, DeviceInfo, Settings } from '@/types/firebase';

type Listener = (data: any) => void;

class MockFirebaseService {
  private listeners: Map<string, Set<Listener>> = new Map();
  private data: any = {};
  private dataGenerator: ReturnType<typeof setInterval> | null = null;

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
            uptime_seconds: 1209600,
            wifi_ssid: 'HomeWiFi_5G',
            ip_address: '192.168.1.156',
            spiffs_used_pct: 1,
            last_seen: Date.now(),
          },
        },
      },
    };
  }

  startDataGenerator() {
    if (this.dataGenerator) return;

    this.dataGenerator = setInterval(() => {
      const deviceData = this.data.devices[DEVICE_ID];

      const variation = (base: number, pct: number) =>
        base + (Math.random() - 0.5) * base * pct;

      deviceData.live.voltage_v = variation(230, 0.02);
      deviceData.live.total_power_w = variation(850, 0.05);
      deviceData.live.leakage_ma = variation(0.3, 0.1);
      deviceData.live.ambient_temp_c = variation(24.5, 0.02);
      deviceData.live.timestamp = Date.now();

      deviceData.circuits.circuit_1.current_a = variation(7.2, 0.05);
      deviceData.circuits.circuit_2.current_a = variation(1.9, 0.1);
      deviceData.circuits.circuit_4.temp_c = variation(28, 0.05);

      this.notifyListeners(`devices/${DEVICE_ID}/live`, deviceData.live);
      for (let i = 1; i <= 4; i++) {
        this.notifyListeners(
          `devices/${DEVICE_ID}/circuits/circuit_${i}`,
          deviceData.circuits[`circuit_${i}`]
        );
      }
      this.notifyListeners(
        `devices/${DEVICE_ID}/faults/active`,
        deviceData.faults.active
      );
    }, 2000);
  }

  stopDataGenerator() {
    if (this.dataGenerator) {
      clearInterval(this.dataGenerator);
      this.dataGenerator = null;
    }
  }

  private getNestedValue(path: string): any {
    const parts = path.split('/');
    let curr = this.data;
    for (const part of parts) {
      if (curr == null) return null;
      curr = curr[part];
    }
    return curr;
  }

  onValue(path: string, callback: Listener): () => void {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path)!.add(callback);
    const initialData = this.getNestedValue(path);
    setTimeout(() => callback(initialData), 0);
    return () => {
      this.listeners.get(path)?.delete(callback);
    };
  }

  private notifyListeners(path: string, data: any) {
    this.listeners.get(path)?.forEach((cb) => cb(data));
  }

  setValue(path: string, value: any) {
    const parts = path.split('/');
    let curr = this.data;
    for (let i = 0; i < parts.length - 1; i++) {
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = value;
    this.notifyListeners(path, value);
  }
}

export const mockFirebase = new MockFirebaseService();
