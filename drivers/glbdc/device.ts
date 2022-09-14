import Homey from 'homey';
import fetch from 'http.min';
import { Mode } from '../../types';
import { Status } from '../../types/status';

const baseUrl = 'servlet/rest/chargebox'; // Prefix with http://192.168.123:8080 device addres
const setModeUrl = `${baseUrl}/mode`; // /ALWAYS_OFF /SCHEMA /ALWAYS_ON - see Mode type
const statusUrl = `${baseUrl}/status?_=`;
const meterInfoUrl = `${baseUrl}/meterinfo/EXTERNAL?_=`

class Charger extends Homey.Device {
  currentStatus?: Status;
  interval?: NodeJS.Timer;
  address?: string;

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('GARO charge box device has been initialized');
    this.address = this.getStoreValue('address');

    this.interval = setInterval(() => { this.pollStatus() }, 5000);
    this.pollStatus();

    if (this.hasCapability('voltage')) {
      // You need to check if migration is needed
      // do not call addCapability on every init!
      await this.removeCapability('voltage');
    }

    if (this.hasCapability('connector') === false) {
      // You need to check if migration is needed
      // do not call addCapability on every init!
      await this.addCapability('connector');
    }

    if (this.hasCapability('mode') === false) {
      // You need to check if migration is needed
      // do not call addCapability on every init!
      await this.addCapability('mode');
    }

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
    this.log('Charger settings where changed');
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
    if (this.interval) {
      clearInterval(this.interval);
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

  async pollStatus() {
    const result: Status = await fetch.json(`http://${this.address}:8080/${statusUrl}${(new Date()).getTime()}`);

    this.setCapabilityValue('measure_temperature', result.currentTemperature).catch(this.error);

    if (result.connector === "CHARGING") {
      this.setCapabilityValue('measure_current', result.currentChargingCurrent / 1000).catch(this.error);
      this.setCapabilityValue('meter_power', result.accSessionEnergy / 1000).catch(this.error);
      this.setCapabilityValue('measure_power', result.currentChargingPower).catch(this.error);
    } else {
      this.setCapabilityValue('measure_current', null).catch(this.error);
      this.setCapabilityValue('meter_power', null).catch(this.error);
      this.setCapabilityValue('measure_power', 0).catch(this.error);
    }

    // Connector
    // this.log('this.getCapabilityValue(connector)', this.getCapabilityValue('connector'));
    // this.log('result.connector', result.connector);
    if (this.getCapabilityValue('connector') !== result.connector) {
      await this.setCapabilityValue('connector', result.connector).catch(this.error);
    }

    // Mode
    // this.log('this.getCapabilityValue(mode)', this.getCapabilityValue('mode'));
    // this.log('result.mode', result.mode);
    if (this.getCapabilityValue('mode') !== result.mode) {
      await this.setCapabilityValue('mode', result.mode).catch(this.error);
    }

    // Trigger actions now that all capabilities are updated
    if (this.currentStatus?.connector !== result.connector) {
      this.driver.ready().then(async () => {
        // @ts-ignore
        await this.driver.triggerDeviceFlow('connectorChanged', { status: result.connector }, this);
      });
    }

    this.currentStatus = result;
  }
}

module.exports = Charger;
