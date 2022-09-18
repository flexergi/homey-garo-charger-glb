import { ConnectorStatus } from "./connector-status"
import { CurrentLimit } from "./current-limit"

export type Config = {
  ocppConnected: boolean, // false
  maxChargeCurrent: number, // 20
  productId: string, // "87"
  programVersion: string, // "7.12"
  firmwareVersion: number, // 7
  firmwareRevision: number, // 12
  lbVersion2: boolean, // true
  serialNumber: number, // 123456
  meterSerialNumber: string, // "123456T"
  meterType: number, // 341
  factoryChargeLimit: number, // 32
  switchChargeLimit: number, // 20
  rfidReaderPresent: boolean, // false
  rfidMode: string, // "RFID_DISABLED"
  powerbackupStatus: number, // 2
  lastTemperature: number, // 20
  warningTemperature: number, // 59
  cutoffTemperature: number, // 64
  reducedIntervalsEnabled: boolean, // true
  reducedCurrentIntervals: CurrentLimit[],
  softwareVersion: number, // 188
  availableVersion: number, // 0
  updateUrl: string, // ""
  networkMode: number, // 1
  networkType: number, // 0
  networkSSID: string, // "ironman"
  webNetworkPassword: string, // ""
  networkAPChannel: number, // 6
  ethNetworkMode: number, // 0
  gcConfigTimestamp: unknown | null, // null
  gcloudActivated: false,
  gcActivatedFrom: null,
  ethGateway: string, // ""
  ethDNS: string, // ""
  ethIP: string, // ""
  ethMask: number, // 24
  localLoadBalanced: string, // true
  groupLoadBalanced: boolean, // false
  groupLoadBalanced101: boolean, // false
  energyReportEnabled: boolean, // false
  master: boolean, // true
  timezone: unknown | null, // null
  slaveList: [
    {
      reference: unknown | null, // null
      serialNumber: number, // 123456
      lastContact: number, // 1663498477390
      online: boolean, // false
      loadBalanced: boolean, // false
      phase: number, // 0
      productId: number, // 124
      meterStatus: number, // 0
      meterSerial: string, // "123456T"
      chargeStatus: number, // 0
      pilotLevel: number, // 6
      accEnergy: number, // 5190700
      firmwareVersion: number, // 7
      firmwareRevision: number, // 12
      wifiCardStatus: number, // 2
      connector: ConnectorStatus,
      accSessionEnergy: number, // 0
      sessionStartValue: number, // -1
      accSessionMillis: number, // 0
      sessionStartTime: null,
      currentChargingCurrent: number, // 0
      currentChargingPower: number, // 0
      nrOfPhases: number, // 1
      twinSerial: number, // -1
      cableLockMode: number, // 0
      minCurrentLimit: number, // 6
      dipSwitchSettings: number, // 8123
      cpuType: number, // 2004739
      updateable: false
    }
  ],
  gridNetType: string, // "TN"
  slaveControlAvailable: boolean, // true
  currentMultiplier: number, // 100
  rfPower: number, // 31
  twinSerial: number, // -1
  twinSwitchLimit: number, // 0
  energySerials: string[], // ["123456"]
  packageVersion: string, // "1.3.6"
  cableAutoUnlocked: boolean, // false
  internetSharingEnabled: boolean, // false
  webAPPassword: string | null, // null
  standalone: boolean, // true
  castra: boolean, // false
  cpuType: number, // 2004739
}
