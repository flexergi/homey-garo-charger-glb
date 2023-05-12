export type ExternalMeterStatus = {
  accEnergy: number; // Watt hours
  apparentPower: number; // Always 0?
  gridNetType: string; // Always "UNKNOWN"?
  meterSerial: string; // numbers and a trailing "T"
  phase1Current: number; // Deci-ampere
  phase1InstPower: number; // Always 0?
  phase2Current: number; // Deci-ampere
  phase2InstPower: number; // Always 0?
  phase3Current: number; // Deci-ampere
  phase3InstPower: number; // Always 0?
  readTime: number; // Timestamp in ms since unix epoch
  success: number; // Always 0?
  type: number; // Always 341?
};
