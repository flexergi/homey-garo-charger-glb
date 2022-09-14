import Homey from 'homey';
import fetch from 'http.min';
import { Mode } from '../../types';
import { Status } from '../../types/status';

const baseUrl = 'servlet/rest/chargebox'; // Prefix with http://192.168.123:8080 device addres
const setModeUrl = `${baseUrl}/mode`; // /ALWAYS_OFF /SCHEMA /ALWAYS_ON - see Mode type
const statusUrl = `${baseUrl}/status?_=`;
const meterInfoUrl = `${baseUrl}/meterinfo/EXTERNAL?_=`
const energyUrl = `${baseUrl}/energy`;

class Charger extends Homey.Device {
  currentStatus?: Status;
  statusInterval?: NodeJS.Timer;
  energyInterval?: NodeJS.Timer;
  address?: string;

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('GARO charge box device has been initialized');
    this.address = this.getStoreValue('address');

    this.statusInterval = setInterval(() => { this.pollStatus() }, 10000);
    this.pollStatus();
    this.energyInterval = setInterval(() => { this.pollEnergy() }, 20000);
    this.pollEnergy();

    // if (this.hasCapability('connector') === false) {
    //   // You need to check if migration is needed
    //   // do not call addCapability on every init!
    //   await this.addCapability('connector');
    // }

    // if (this.hasCapability('mode') === false) {
    //   // You need to check if migration is needed
    //   // do not call addCapability on every init!
    //   await this.addCapability('mode');
    // }

    this.registerCapabilityListener("mode", (mode: Mode) => this.setMode(mode).catch(this.error));
  }

  async setMode(value: Mode) {
    return fetch.post(`http://${this.address}:8080/${setModeUrl}/${value}`);
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('Charger has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings: {}, newSettings: {}, changedKeys: {} }): Promise<string|void> {
    this.log('Charger settings were changed');
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
    try {
      const response = JSON.parse(result.data);
      if (response.stopValue) {
        this.setCapabilityValue('meter_power', response.stopValue).catch(this.error);
      }
    } catch (e) {
      this.error(e);
    }
  }

  async pollStatus() {
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

    // Trigger actions now that all capabilities are updated (change awaited)

    if (this.currentStatus?.connector !== result.connector) {
      this.driver.ready().then(async () => {
        // @ts-ignore
        await this.driver.triggerDeviceFlow('connectorChanged', { status: result.connector }, this);
      });
    }

    if (this.currentStatus?.mode !== result.mode) {
      this.driver.ready().then(async () => {
        // @ts-ignore
        await this.driver.triggerDeviceFlow('modeChanged', { mode: result.mode }, this);
      });
    }

    this.currentStatus = result;
  }
}

module.exports = Charger;
