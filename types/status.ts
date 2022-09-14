import { ConnectorState } from "./connector-state";
import { Mode } from "./mode";

export type Status = {
  serialNumber: number;
  ocppState: unknown;
  connectedToInternet: boolean;
  freeCharging: boolean;
  ocppConnectionState: unknown;
  connector: ConnectorState;
  mode: Mode;
  currentLimit: number;
  factoryCurrentLimit: number; // amp (32)
  switchCurrentLimit: 20; // amp (20)
  powerMode: "ON" | "OFF"; // OFF when charger connected but mode is ALWAYS_OFF or inactive SCHEMA. ON when charging enabled
  currentChargingCurrent: number;
  currentChargingPower: number;
  accSessionEnergy: number;
  sessionStartTime: unknown;
  chargeboxTime: string; // "21:19",
  accSessionMillis: number;
  latestReading: number;
  chargeStatus: number; // 48 is connected not charging?
  updateStatus: {
    serialsToUpdate: number[]; // Serial number of devices to update
    serialsUpdated: number[]; // Serial number of device that was updated
    currentlyUpdating: number; // -1 means no longer updating
    currentProgress: number; // Percent, 100 is completed
    failedUpdate: string; // "NO_ERROR"
  };
  currentTemperature: number; // Celcius (25)
  sessionStartValue: number; // -1 ?
  nrOfPhases: number; // 1 or 3?
  slaveControlWarning: boolean;
  supportConnectionEnabled: boolean;
  datetimeConfigured: boolean;
  pilotLevel: number; // 6?
  mainCharger: {
    reference?: unknown; // null
    serialNumber: number; // 123456
    lastContact: number; // unix timestamp 1663010363786
    online: boolean;
    loadBalanced: boolean;
    phase: number; // 0 ?
    productId: number; // type of charger
    meterStatus: number; // 0 ?
    meterSerial: string; // "012345T"
    chargeStatus: number; // 0 ?
    pilotLevel: number; // ?
    accEnergy: number; // KWh 5156600
    firmwareVersion: number; // 7
    firmwareRevision: number; // 9
    wifiCardStatus: number; // 2
    connector: "NOT_CONNECTED" | "CONNECTED";
    accSessionEnergy: number; // 0?
    sessionStartValue: number; // -1
    accSessionMillis: number; // 0
    sessionStartTime?: number; // null
    currentChargingCurrent: number; // 0
    currentChargingPower: number; // 0
    nrOfPhases: number; // 1 or 3?
    twinSerial: number; // -1?
    cableLockMode: number; // 0?
    minCurrentLimit: number; // 6?
    dipSwitchSettings: number; // 8123?
  };
  twinCharger?: unknown;
};
