import Homey from 'homey';
import fetch from 'http.min';
import { Mode } from '../../types';
import { Config } from '../../types/config';
import { Status } from '../../types/status';
import { configUrl, currentLimitUrl, energyUrl, setModeUrl, statusUrl } from './device-const';

export class Charger extends Homey.Device {
  currentStatus?: Status;
  statusInterval?: NodeJS.Timeout;
  energyInterval?: NodeJS.Timeout;
  address?: string;

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('GARO charge box device has been initialized');
    this.address = this.getSetting('host');

    if (this.hasCapability('connector') === false) {
      await this.addCapability('connector');
    }

    if (this.hasCapability('mode') === false) {
      await this.addCapability('mode');
    }
    this.registerCapabilityListener("mode", (mode: Mode) => this.setMode(mode).catch(this.error));

    if (this.hasCapability('voltage')) {
      await this.removeCapability('voltage');
    }

    if (this.hasCapability('current_limit') === false) {
      await this.addCapability('current_limit');
    }
    this.registerCapabilityListener("current_limit", (ampere: number) => this.setCurrentLimit(ampere).catch(this.error));

    if (this.hasCapability('chargerStatus')) {
      await this.removeCapability('chargerStatus');
    }

    // Start polling now that all capabilities are set up
    this.statusInterval = this.homey.setInterval(() => { this.pollStatus() }, 10000);
    this.pollStatus();
    this.energyInterval = this.homey.setInterval(() => { this.pollEnergy() }, 20000);
    this.pollEnergy();
  }

  async setMode(value: Mode) {
    try {
      console.log(`POST new mode ${value}`);
      const result = await fetch.post(`http://${this.address}:8080/${setModeUrl}/${value}`);
      console.log(`    POST new mode ${value} set`);
      return result;
    } catch (e: any) {
      this.error('POST new mode failed: ', e.message);
    }
  }

  async setCurrentLimit(ampere: number) {
    try {
      const config = await this.getConfig();

      console.log(`POST new current limit ${ampere}`);
      const data: Config = {
        ...config,
        reducedIntervalsEnabled: true,
        reducedCurrentIntervals: [
          {
            schemaId: 1,
            chargeLimit: Math.min(config.switchChargeLimit, ampere),
            start: '00:00:00',
            stop: '24:00:00',
            weekday: 8,
          }
        ],
      };
      const result = await fetch.post(`http://${this.address}:8080/${currentLimitUrl}`, data);
      console.log(`   POST new current limit ${ampere} set`);
      return result;
    } catch (e: any) {
      this.error('POST new mode failed: ', e.message);
    }
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('Charger has been added');
  }

  async onSettings(event: any): Promise<string|void> {
    this.log('Charger settings were changed');
    const { newSettings } = event;
    this.address = newSettings.address;
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('Charger was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('Charger has been deleted');
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
    if (this.energyInterval) {
      clearInterval(this.energyInterval);
    }
  }

  onDiscoveryResult(discoveryResult: any) {
    // Return a truthy value here if the discovery result matches your device.
    this.log('onDiscoveryResult', discoveryResult);
    return discoveryResult.id === this.getData().id;
  }

  async onDiscoveryAvailable(discoveryResult: any) {
    // This method will be executed once when the device has been found (onDiscoveryResult returned true)
    this.log('onDiscoveryAvailable', discoveryResult);
  }

  async pollEnergy() {
    try {
      const dateNow = new Date();
      const data = {
        chargeboxSerial: this.currentStatus?.serialNumber.toString(),
        meterSerial: "DEFAULT",
        month: (dateNow.getMonth() + 1).toString(),
        resolution: "DAY",
        year: dateNow.getFullYear().toString(),
      };
      const url = `http://${this.address}:8080/${energyUrl}`;
      const result = await fetch.post(url, data);
      const response = JSON.parse(result.data);
      if (response.stopValue) {
        this.setCapabilityValue('meter_power', response.stopValue).catch(this.error);
      }
    } catch (e: any) {
      this.error(e.message);
    }
  }

  async getConfig(): Promise<Config> {
    const url = `http://${this.address}:8080/${configUrl}${(new Date()).getTime()}`;
    console.log(`POST ${url}`);
    const result = await fetch(url);
    console.log(`    POST ${url} done`);
    return result.data;
  }

  async pollStatus() {
    try {
      const result: Status = await fetch.json(`http://${this.address}:8080/${statusUrl}${(new Date()).getTime()}`);

      this.setCapabilityValue('measure_temperature', result.currentTemperature).catch(this.error);

      if (result.connector === "CHARGING") {
        this.setCapabilityValue('measure_current', result.currentChargingCurrent / 1000).catch(this.error);
        this.setCapabilityValue('measure_power', result.currentChargingPower).catch(this.error);
      } else {
        this.setCapabilityValue('measure_current', 0).catch(this.error);
        this.setCapabilityValue('measure_power', 0).catch(this.error);
      }

      // Connector
      const currentConnectorValue = this.getCapabilityValue('connector');
      if (currentConnectorValue !== result.connector) {
        this.log(`connector changed: current: ${currentConnectorValue} - new: ${result.connector}`);
        await this.setCapabilityValue('connector', result.connector).catch(this.error);
      }

      // Mode
      const currentModeValue = this.getCapabilityValue('mode');
      if (currentModeValue !== result.mode) {
        this.log(`mode changed: current: ${currentModeValue} - new: ${result.mode}`);
        await this.setCapabilityValue('mode', result.mode).catch(this.error);
      }

      // CurrentLimit
      const currentCurrentLimitValue = this.getCapabilityValue('current_limit');
      if (currentCurrentLimitValue !== result.currentLimit) {
        this.log(`currentLimit changed: current: ${currentCurrentLimitValue} - new: ${result.currentLimit}`);
        await this.setCapabilityValue('current_limit', result.currentLimit).catch(this.error);
      }

      // Trigger actions now that all capabilities are updated (change awaited)

      // This one is needed due to name not ending in "_changed" which would have trigger automatically on capability change
      if (this.currentStatus?.connector !== result.connector) {
        // @ts-ignore
        await this.driver.triggerDeviceFlow('connectorChanged', { status: result.connector }, this);
      }

      // This one is needed due to name not ending in "_changed" which would have trigger automatically on capability change
      if (this.currentStatus?.mode !== result.mode) {
        // @ts-ignore
        await this.driver.triggerDeviceFlow('modeChanged', { mode: result.mode }, this);
      }

      // Auto triggered by Homey due to name ending in "_changed"
      // if (this.currentStatus?.currentLimit !== result.currentLimit) {
        // @ts-ignore
        // await this.driver.triggerDeviceFlow('current_limit_changed', { currentLimit: result.currentLimit }, this);
      // }

      this.currentStatus = result;
    } catch (e: any) {
      this.error(e);
    }
  }
}

module.exports = Charger;
